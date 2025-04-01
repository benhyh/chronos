import tkinter as tk
import uuid
import json
import os
import shutil
from task_manager import TaskManager, Task
from storage import Storage
from datetime import datetime
from tkinter import filedialog

class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.strftime('%Y-%m-%d')  # Only return YYYY-MM-DD
        return super().default(obj)

class TaskAPI:
    def __init__(self):
        self.task_manager = TaskManager()
        self.storage = Storage("tasks.db")  # To store our tasks
        
        # Organization rules as in-memory dictionary keyed by base folder path
        self.organization_rules = {}
        self.current_folder_path = None
        
        # Load tasks from database on startup
        self.load_tasks_from_db()
    
    def get_all_tasks(self):
        tasks=[]
        for task in self.task_manager.list_tasks():
            try:
                task_dict = task.dict()
            except AttributeError:
                task_dict = task.model_dump()

            # Convert datetime to string before sending to frontend - date only
            if task_dict.get('due_date') and isinstance(task_dict['due_date'], datetime):
                task_dict['due_date'] = task_dict['due_date'].strftime('%Y-%m-%d')

            if task.completed:
                task_dict["status"] = "Completed"
            elif task.inProgress:
                task_dict["status"] = "In Progress"
            else:
                task_dict["status"] = "Pending"

            if task.completed:
                task_dict["status_code"] = 2
            elif task.inProgress:
                task_dict["status_code"] = 1
            else:
                task_dict["status_code"] = 0

            tasks.append(task_dict)
        return tasks
    
    def get_recent_activities(self):
        try:
            activities = self.storage.get_recent_activities()
            return activities;
        except Exception as e:
            print(f"There has been error with getting the most recent activity for our dashboard: {e}")
            return None


    def get_latest_tasks(self):
        try:
            tasks = self.storage.get_latest_tasks()
            return tasks;
        except Exception as e:
            print(f"There has been error with getting the latest tasks for our dashboard: {e}")
            return None


    def add_activity(self, id: str, type: str, title: str, timestamp: str, status: str, due_date: str = None):
        try:
            activity_data = {
                "id": id,
                "type": type,
                "title": title,
                "timestamp": timestamp,
                "status": status,
                "due_date": due_date
            }
            
            activity = self.storage.add_activity(activity_data)

            return activity
        except Exception as e:
            print(f"There has been error with adding the activity in our database for dashboard purposes: {e}")
            return False

    def add_task(self, title, description, due_date=None, priority=1, status=0):
        # Create a new Task object with status based on integer code
        # 0: Pending, 1: In Progress, 2: Completed
        
        # Parse due_date in a timezone-safe way if present
        parsed_due_date = None
        if due_date:
            # Strip any time component to avoid timezone issues
            if 'T' in due_date:
                due_date = due_date.split('T')[0]
            elif ' ' in due_date:
                due_date = due_date.split(' ')[0]
            
            parsed_due_date = datetime.fromisoformat(due_date)
        
        new_task = Task(
            id= str(uuid.uuid4()),
            title=title,
            description=description, 
            due_date=parsed_due_date,
            priority=priority,
            pending=(status == 0),
            inProgress=(status == 1),
            completed=(status == 2)
        )
        
        # Add it to the task manager
        self.task_manager.add_task(new_task)

        # Save to database
        self.save_task_to_db(new_task)
    
        # Add activity
        self.add_activity(
            id=str(uuid.uuid4()),
            type="tasks",
            title=f"Task created: {title}",
            timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            status="Pending",
            due_date=due_date
        )
    
        # Return the task with status string for frontend
        try:
            task_dict = new_task.dict()  # For older Pydantic
        except AttributeError:
            task_dict = new_task.model_dump()  # For newer Pydantic
        
        # Convert datetime to string before sending to frontend - date only
        if task_dict.get('due_date') and isinstance(task_dict['due_date'], datetime):
            task_dict['due_date'] = task_dict['due_date'].strftime('%Y-%m-%d')
        
        # Convert status code to string for frontend
        status_strings = {0: "Pending", 1: "In Progress", 2: "Completed"}
        task_dict["status"] = status_strings.get(status, "Pending")
        task_dict["status_code"] = status
        return task_dict

    def complete_task(self, task_id):
        # Mark a task as completed using UUID
        for task in self.task_manager.list_tasks():
            if task.id == task_id:
                task.completed = True
                task.inProgress = False
                task.pending = False
                
                # Update in database
                self.storage.increment_stat("tasks_completed")
                self.update_task_in_db_by_id(task)
                
                return True
        return False
    
    def set_task_status(self, task_id, status):
        # Set the task status based on integer code using UUID
        # 0: Pending, 1: In Progress, 2: Completed
        for task in self.task_manager.list_tasks():
            if task.id == task_id:
                # Update status flags
                task.pending = (status == 0)
                task.inProgress = (status == 1)
                task.completed = (status == 2)

                if status == 2:
                    self.storage.increment_stat("tasks_completed")
                
                # Update in database
                self.update_task_in_db_by_id(task)
                
                # Add activity
                status_strings = {0: "Pending", 1: "In Progress", 2: "Completed"}
                self.add_activity(
                    id=str(uuid.uuid4()),
                    type="tasks",
                    title=f"Task status updated: {task.title}",
                    timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                    status=status_strings.get(status, "Pending"),
                    due_date=task.due_date.strftime('%Y-%m-%d') if task.due_date else None
                )
                
                return True
        return False
    
    def update_task(self, task_id, title, description, due_date=None, priority=1, status=0):
        # Find the task with the given UUID
        for task in self.task_manager.list_tasks():
            if task.id == task_id:  # Using UUID instead of index
                # Update task attributes
                task.title = title if title != "" else task.title
                task.description = description if description != "" else task.description
                
                # Parse due_date in a timezone-safe way if present
                if due_date:
                    # Strip any time component to avoid timezone issues
                    if 'T' in due_date:
                        due_date = due_date.split('T')[0]
                    elif ' ' in due_date:
                        due_date = due_date.split(' ')[0]
                    
                    task.due_date = datetime.fromisoformat(due_date)
                else:
                    task.due_date = None
                
                task.priority = priority if priority != 0 else task.priority
                
                # Update status flags based on integer code
                # 0: Pending, 1: In Progress, 2: Completed
                task.pending = (status == 0)
                task.inProgress = (status == 1)
                task.completed = (status == 2)
                
                # Update in database using UUID
                self.update_task_in_db_by_id(task)
                
                # Return updated task with status string
                try:
                    task_dict = task.dict()  # For older Pydantic
                except AttributeError:
                    task_dict = task.model_dump()  # For newer Pydantic
                
                # Convert datetime to string before sending to frontend - date only
                if task_dict.get('due_date') and isinstance(task_dict['due_date'], datetime):
                    task_dict['due_date'] = task_dict['due_date'].strftime('%Y-%m-%d')
                
                # Convert status code back to string for frontend
                status_strings = {0: "Pending", 1: "In Progress", 2: "Completed"}
                task_dict["status"] = status_strings.get(status, "Pending")
                task_dict["status_code"] = status
                return task_dict
        return None
    
    def update_task_in_db_by_id(self, task):
        with self.storage.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE tasks SET title = ?, description = ?, due_date = ?, completed = ?, in_progress = ?, pending = ?, priority = ? WHERE id = ?",
                (task.title, task.description, task.due_date.strftime('%Y-%m-%d') if task.due_date else None,
                1 if task.completed else 0, 1 if task.inProgress else 0, 1 if task.pending else 0,
                task.priority, task.id)
            )
            conn.commit()
    
    def delete_task(self, task_id):
        # Remove a task using UUID
        for task in self.task_manager.list_tasks():
            if task.id == task_id:
                self.task_manager.remove_task(task)
                
                # Delete from database using UUID
                self.delete_task_from_db_by_id(task_id)
                
                return True
        return False

    def delete_task_from_db_by_id(self, task_id):
        with self.storage.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))  # Fixed: added comma to make it a tuple
            conn.commit()
    
    # Database operations
    def save_task_to_db(self, task):
        with self.storage.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO tasks (id, title, description, due_date, completed, in_progress, pending, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (task.id, task.title, task.description, task.due_date.strftime('%Y-%m-%d') if task.due_date else None, 
                 1 if task.completed else 0, 1 if task.inProgress else 0, 1 if task.pending else 0, task.priority)
            )
            conn.commit()
    
    def update_task_in_db(self, task):
        with self.storage.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE tasks SET title = ?, description = ?, due_date = ?, completed = ?, in_progress = ?, pending = ?, priority = ? WHERE title = ? AND description = ?",
                (task.title, task.description, task.due_date.strftime('%Y-%m-%d') if task.due_date else None, 
                 1 if task.completed else 0, 1 if task.inProgress else 0, 1 if task.pending else 0, 
                 task.priority, task.title, task.description)
            )
            conn.commit()
    
    def delete_task_from_db(self, task):
        with self.storage.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "DELETE FROM tasks WHERE title = ? AND description = ?",
                (task.title, task.description)
            )
            conn.commit()
    
    def load_tasks_from_db(self):
        with self.storage.get_connection() as conn:
            cursor = conn.cursor()
            # Include id column in query
            cursor.execute("SELECT id, title, description, due_date, completed, in_progress, pending, priority FROM tasks")
            tasks_data = cursor.fetchall()
            
            # Clear current tasks
            self.task_manager = TaskManager()
            
            # Add each loaded task to the task manager with UUID
            for id, title, description, due_date, completed, in_progress, pending, priority in tasks_data:
                self.task_manager.add_task(Task(
                    id=id,  # Store the UUID
                    title=title,
                    description=description,
                    due_date=datetime.fromisoformat(due_date) if due_date else None,
                    completed=bool(completed),
                    inProgress=bool(in_progress),
                    pending=bool(pending),
                    priority=priority
                ))
    
    # Folder Operations

    def select_folder(self):
        """Opens a folder selection dialog and returns the selected path"""
        try:
            root = tk.Tk()
            root.withdraw()

            folder_path = filedialog.askdirectory()
            root.destroy()

            if folder_path:
                self.current_folder_path = folder_path
                # If this is a new folder, initalize empty rules
                if folder_path not in self.organization_rules:
                    self.organization_rules[folder_path] = []
                    
                return folder_path if folder_path else None
            
            return None
        except Exception as e:
            print(f"Error in select_folder: {e}")
            return None

    def scan_folder(self, folder_path):
        """Scans a folder and returns its contents"""
                
        if not os.path.exists(folder_path):
            print(f"Folder does not exist: {folder_path}")
            return []
        
        try:
            # Function to get file size in a human-readable format
            def get_human_readable_size(size_bytes):
                # Convert size to readable format (KB, MB, etc.)
                for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
                    if size_bytes < 1024.0:
                        return f"{size_bytes:.1f} {unit}"
                    size_bytes /= 1024.0
                return f"{size_bytes:.1f} PB"
            
            # Function to get file extension
            def get_file_extension(filename):
                # Get file extension (e.g., '.txt', '.jpg')
                _, ext = os.path.splitext(filename)
                return ext.lower()
                
            # Recursive function to scan a directory
            def scan_directory(dir_path):
                items = []
                
                try:
                    # List all files and folders in the directory
                    with os.scandir(dir_path) as entries:
                        for entry in entries:
                            item_id = str(uuid.uuid4())
                            
                            if entry.is_dir():
                                # it's a folder
                                children = scan_directory(entry.path)
                                items.append({
                                    "id": f"folder-{item_id}",
                                    "name": entry.name,
                                    "type": "folder",
                                    "path": entry.path,
                                    "children": children
                                })
                            else:
                                # it's a file
                                try:
                                    size = get_human_readable_size(entry.stat().st_size)
                                    extension = get_file_extension(entry.name)
                                    
                                    items.append({
                                        "id": f"file-{item_id}",
                                        "name": entry.name,
                                        "type": "file",
                                        "path": entry.path,
                                        "size": size,
                                        "extension": extension
                                    })
                                except Exception as e:
                                    print(f"Error processing file {entry.path}: {e}")
                except PermissionError:
                    print(f"Permission denied accessing: {dir_path}")
                except Exception as e:
                    print(f"Error scanning directory {dir_path}: {e}")
                
                return items
                
            # Start the scan from the root folder
            result = scan_directory(folder_path)
            return result
            
        except Exception as e:
            print(f"Error in scan_folder: {e}")
            return []
        
    # Organization Rules Operations

    def add_organization_rule(self, base_folder_directory: str, folder_name: str, desired_folder_directory: str, extensions: list[str]) -> dict:
        """
        Add a new organization rule for the current working folder

        Parameters:
        - base_folder: Base folder directory (the scanned folder)
        - folder_name: Name of the subfolder to create/use for organizing
        - extensions: List of file extensions that should go in this folder

        Implementation steps:
        1. Validate inputs
        2. Create folder if it doesn't exist
        3. Generate rule object
        4. Store in memory
        5. Return the rue

        Returns: 
        A dictionary with the crated rule details
        """

        try:
            if not os.path.exists(base_folder_directory):
                print(f"Base folder doesn't exist: {base_folder_directory}")
                return
            
            # Create the target folder if it doesn't exist
            target_folder = os.path.join(base_folder_directory, folder_name)
            if not os.path.exists(target_folder):
                os.makedirs(target_folder)

            # Create the desired folder if it doesn't exist
            desired_folder = os.path.join(base_folder_directory, desired_folder_directory)
            if not os.path.exists(desired_folder):
                os.makedirs(desired_folder)

            rule_id = str(uuid.uuid4())
            rule = {
                "id": rule_id,
                "base_folder_directory": base_folder_directory,
                "desired_folder_directory": desired_folder,
                "folder_name": folder_name,
                "full_path": target_folder,
                "extensions": extensions,
                "enabled": True
            }

            # Initialize the list for this base folder if it doesn't exist
            if base_folder_directory not in self.organization_rules:
                self.organization_rules[base_folder_directory] = []
            
            # Add to in-memory rules
            self.organization_rules[base_folder_directory].append(rule)

            return rule
        
        except Exception as e:
            print(f"Error in add_organization_rules: {e}") 
            return None
   
    def delete_organization_rules(self, rule_id, base_folder=None):
        """Delete an organization rule"""
        if base_folder is None:
            base_folder = self.current_folder_path
        
        if not base_folder or base_folder not in self.organization_rules:
            return False
        
        rules = self.organization_rules[base_folder]
        self.organization_rules[base_folder] = [rule for rule in rules if rule["id"] != rule_id]

        return True
    
    def clear_organization_rules(self, base_folder=None):
        """Clear all organization rules for the specified folder"""
        if base_folder is None:
            base_folder = self.current_folder_path
        
        if base_folder in self.organization_rules:
            self.organization_rules[base_folder] = []
            return True
        return False
    
    def organize_files(self, misplaced_files):
        """Organize files by moving them to their correct folders"""
        try:
            for file in misplaced_files:
                source_path = file['source_path']
                destination_path = os.path.join(
                    os.path.dirname(file['destination_path']),
                    file['name']
                )
                
                # Create the destination directory if it doesn't exist
                os.makedirs(os.path.dirname(destination_path), exist_ok=True)

                self.storage.increment_stat("files_organized")
                
                # Move the file
                shutil.move(source_path, destination_path)
            
            # Add activity
            self.add_activity(
                id=str(uuid.uuid4()),
                type="organization",
                title=f"Files organized: {len(misplaced_files)} files moved",
                timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                status="Completed"
            )
            
            return True
        except Exception as e:
            print(f"Error in organize_files: {e}")
            return False
    
    def update_organization_rule(self, rule_id: str, base_folder_directory: str, folder_name: str, desired_folder_directory: str, extensions: list[str]) -> dict:
        """
        Update an existing organization rule

        Parameters:
        - rule_id: ID of the rule to update
        - base_folder_directory: Base folder directory
        - desired_folder_directory: Desired folder directory
        - extensions: List of extensions

        Returns:
        The updated rule as a dictionary
        """

        try:
            updated_rule = {}

            # Creates the desired file directory if it does not exist
            target_folder = os.path.join(base_folder_directory, folder_name)
            if not os.path.exists(target_folder):
                os.makedirs(target_folder)
                    
            # Find the rule in memory
            if base_folder_directory in self.organization_rules:
                rules = self.organization_rules[base_folder_directory]
                
                index = -1
                for i, rule in enumerate(rules):
                    if rule["id"] == rule_id:
                        index = i
                        break

                if (index != -1):
                    rule = rules[index]

                    desired_folder = os.path.join(base_folder_directory, desired_folder_directory)
                    if not os.path.exists(desired_folder):
                        os.makedirs(desired_folder)
                    
                    updated_rule = {          
                        "id": rule_id,
                        "base_folder_directory": base_folder_directory,
                        "desired_folder_directory": desired_folder,
                        "folder_name": folder_name,
                        "full_path": target_folder,
                        "extensions": extensions,
                        "enabled": rule["enabled"]
                    }

                    self.organization_rules[base_folder_directory][index] = updated_rule
                
                else: 
                    print("We couldn't find that rule in the list. Please try again.")
                    return None
            else:
                print("We couldn't find any rules in the base folder directory. Please try again.")
                return None
            
            return updated_rule 
        except Exception as e:
            print(f"Failed to call update_organization_rule: {e}")
            return None

    def get_dashboard_stats(self):
        """Get statistics of the dashboard"""
        try:
        
            stats = self.storage.get_stats()

            # directly get our pending tasks from the task maanger
            pending_count = sum(1 for task in self.task_manager.list_tasks() if task.pending)

            stats["pending_tasks"] = pending_count

            return stats
        except Exception as e:
            print(f"There has been an error with getting the dashboard stats: {e}")
            return {
                "tasks_completed": 0,
                "files_organized": 0,
                "pending_tasks": 0,
            }
    
