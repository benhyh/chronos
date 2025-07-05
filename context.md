This file is a merged representation of the entire codebase, combined into a single document by Repomix.
The content has been processed where security check has been disabled.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Security check has been disabled - content may contain sensitive information
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
backend/
  src/
    api.py
    automation.py
    data_processor.py
    dev_server.py
    file_ops.py
    gui.py
    main.py
    scheduler.py
    storage.py
    task_manager.py
  build.py
frontend/
  public/
    vite.svg
  src/
    assets/
      react.svg
    components/
      ui/
        badge.tsx
        button.tsx
        calendar.tsx
        card.tsx
        checkbox.tsx
        dialog.tsx
        dropdown-menu.tsx
        input.tsx
        label.tsx
        progress.tsx
        select.tsx
        separator.tsx
        switch.tsx
        tabs.tsx
        textarea.tsx
      Dashboard.tsx
      Files.tsx
      Layout.tsx
      Sidebar.tsx
      TaskManager.tsx
    lib/
      api.ts
      utils.ts
    types/
      task.ts
    App.css
    App.tsx
    index.css
    main.tsx
    vite-env.d.ts
  .gitignore
  components.json
  eslint.config.js
  index.html
  package.json
  postcss.config.js
  tailwind.config.js
  tsconfig.app.json
  tsconfig.json
  tsconfig.node.json
  vite.config.ts
.gitignore
README.md
```

# Files

## File: backend/src/api.py
```python
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
```

## File: backend/src/automation.py
```python
# Import tools that help us watch folders for any changes (like a security camera for files)
from watchdog.observers import Observer  
# Import a special tool that helps us respond when files change
from watchdog.events import FileSystemEventHandler

# Create an AutomationRule class - think of it as a set of instructions for what to do when certain files change
class AutomationRule:
    # When we create a new rule, we need two things:
    def __init__(self, pattern, action):
        # A pattern that tells us which files to watch (like a filter that only shows certain files)
        self.pattern = pattern
        # An action to take when those files change (like what to do when we see something on our camera)
        self.action = action


# Create a FolderWatcher class - think of it as a security guard that watches folders and follows rules
class FolderWatcher(FileSystemEventHandler):
    # When we hire a new security guard, we give them a list of rules to follow
    def __init__(self, rules): 
        # Store the list of rules so our guard knows what to do
        self.rules = rules
        
    # This is what happens when a file is changed (like when our security camera spots movement)
    def on_modified(self, event):
        # Check each rule one by one (like going through a checklist)
        for rule in self.rules:
            # If the changed file matches our pattern (like "is this what we're looking for?")
            if rule.pattern.match(event.src_path):
                # Then do the action we planned (like "sound the alarm!" or "send a text message!")
                rule.action(event.src_path)
```

## File: backend/src/data_processor.py
```python
# Import the json module - it's like a translator that helps us convert between Python data and text files
import json
# Import the csv module - it's like a spreadsheet helper that lets us work with Excel-like files
import csv 
# Import special tools from typing - these are like labels that help us organize our data
from typing import Dict, List
from storage import Storage

# Create a DataProcessor class - think of it as a kitchen appliance that processes our data
class DataProcessor():

    def __init__(self, storage: Storage):
        self.storage = storage
    
    # This is a special method that belongs to the class, not individual kitchen appliances
    @staticmethod
    # This function saves tasks to a JSON file - like putting your toys in a special box for safekeeping
    def save_tasks_json(tasks: List[Dict], filename: str):
        # Open a file (like opening the toy box) - 'w' means we're going to write to it
        with open(filename, 'w') as f:
            # Convert our Python data to JSON and save it - like carefully arranging toys in the box
            # indent=4 makes it look neat, like organizing toys in rows instead of a messy pile
            json.dump(tasks, f, indent=4)
    
    # Another special method that belongs to the class
    @staticmethod
    # This function loads tasks from a JSON file - like taking toys out of the storage box
    def load_tasks_json(filename: str) -> List[Dict]:
        # We'll try to do something, but have a backup plan if it doesn't work
        try:
            # Open the file for reading - like opening the toy box to see what's inside
            with open(filename, 'r') as f:
                # Convert the JSON data back to Python and return it - like taking all toys out of the box
                return json.load(f)
        # If the file isn't found (like if someone moved the toy box)
        except FileNotFoundError:
            # Return an empty list - like saying "if we can't find the toy box, let's start with no toys"
            return []
```

## File: backend/src/dev_server.py
```python
import webview
import os
import sys
import time
from api import TaskAPI

def main():
    task_api = TaskAPI()
    
    # Create PyWebView window pointing to Vite dev server
    window = webview.create_window(
        'Chronos',
        'http://localhost:5173',  # Vite's default dev server port
        width=1200,
        height=800,
        resizable=False,
        min_size=(800, 600),
        js_api=task_api
    )

    # Start the window with debugging enabled
    webview.start(debug=True)

if __name__ == '__main__':
    main()
```

## File: backend/src/file_ops.py
```python
# Import tools to work with the computer's folders and files
import os

# Import a tool that helps us move files around (like a digital moving company)
import shutil

# Import a special tool that makes working with file paths easier (like a GPS for files)
from pathlib import Path

watch_folder = r'C:\Users\bhyh0\OneDrive\Desktop\2025\accelerator\phase-1\task_automation_suite\src\watch_folder'
# so we either instantiate it or pass it in as an arg
# in our use case, we pass it as an arg cause our watch_folder is dynamic

# Create a FileManager class - think of it as a robot that organizes your files
class FileManager:
    # When we create a new robot, we tell it which folder to watch
    def __init__(self, watch_folder: str):
        # Convert the folder name to a special Path object (our robot's map)
        self.watch_folder = Path(watch_folder)
    
    # This is like giving our robot instructions to sort files by their type
    def organize_by_extension(self):
        # Look at each file in the folder (like picking up each toy in a messy room)
        for file in self.watch_folder.iterdir():
            # Check if it's a file and not a folder (is it a toy or a toy box?)
            if file.is_file():
                # Get the file's extension (like checking if it's a LEGO or a doll)
                # The [1:] skips the dot, like in ".txt" we just want "txt"
                # If there's no extension, call it 'no extension'
                ext = file.suffix[1:] or 'no extension'
                
                # Create a folder for this type of file (like a special box for LEGOs)
                ext_folder = self.watch_folder / ext
                
                # Make sure the folder exists (if we don't have a LEGO box, make one)
                ext_folder.mkdir(exist_ok=True)
                
                # Move the file to its proper folder (put the LEGO in the LEGO box)
                shutil.move(str(file), str(ext_folder / file.name))
```

## File: backend/src/gui.py
```python
# Import tkinter - it's like bringing a box of art supplies to build our app's window
import tkinter as tk
# Import ttk from tkinter - it's like getting extra fancy decorations for our art project
from tkinter import ttk
# Import filedialog - it's like a helper that lets users pick files and folders
from tkinter import filedialog, messagebox
# Import re for regular expressions - it's like a special tool for matching patterns in text
import re
# Import threading - it's like having helpers that can do tasks at the same time
import threading
# Import os.path - it's like a map that helps us find our way around files and folders
import os.path

# Import our backend components - like bringing all the robot parts together
from task_manager import TaskManager, Task  # For managing our to-do list
from file_ops import FileManager  # For organizing files
from automation import AutomationRule, FolderWatcher  # For watching folders and doing things automatically
from data_processor import DataProcessor  # For saving and loading our data
from scheduler import TaskScheduler  # For running tasks at specific times
from storage import Storage  # For storing our tasks in a database
from watchdog.observers import Observer  # For watching folders for changes
from customtkinter import * # Custom GUI

# Create a class called AutomationGUI - think of this as a blueprint for building a robot
# that will help us organize our tasks and files
class AutomationGUI:
    # This is what happens when we first build our robot
    def __init__(self, root):
        # The root is like the robot's body - it's the main window of our app
        self.root = root
        # This gives our robot a name tag that shows at the top of the window
        self.root.title("Task Automation Suite")
        
        # Create our backend components - like giving our robot a brain and muscles
        self.task_manager = TaskManager()  # The brain that remembers all our tasks
        self.file_manager = None  # We'll create this when the user picks a folder to watch
        self.task_scheduler = TaskScheduler()  # The clock that helps run tasks on time
        self.storage = Storage("tasks.db")  # The memory bank that saves tasks even when the app is closed
        
        # Now let's call another method to build all the controls for our robot
        self.setup_ui()
        
    # This method builds all the buttons and controls for our robot
    def setup_ui(self):
        # Create tabs - these are like different pages in a notebook
        # so we can organize different features
        self.tab_control = ttk.Notebook(self.root)
        
        # Create the first page in our notebook for managing tasks
        # It's like a blank piece of paper where we'll add buttons later
        self.task_tab = ttk.Frame(self.tab_control)
        
        # Create the second page for managing files
        # Another blank piece of paper for a different topic
        self.file_tab = ttk.Frame(self.tab_control)
        
        # Create the third page for scheduling tasks
        # Another blank piece of paper for scheduling
        self.schedule_tab = ttk.Frame(self.tab_control)
        
        # Add our pages to the notebook with labels
        # This is like putting a sticky note on each page so we know what it's for
        self.tab_control.add(self.task_tab, text="Tasks")
        self.tab_control.add(self.file_tab, text="File Management")
        self.tab_control.add(self.schedule_tab, text="Scheduling")
        
        # Put the notebook in our main window and make it fill the space
        # This is like gluing our notebook onto the robot so it's always visible
        # expand=1 means it grows when the window grows (like a sponge in water)
        # fill="both" means it fills in both directions (like water filling a container)
        self.tab_control.pack(expand=1, fill="both")
        
        # Now let's set up each tab with its own controls
        self.setup_task_tab()
        self.setup_file_tab()
        self.setup_schedule_tab()
    
    # This method sets up all the controls for the Tasks tab
    def setup_task_tab(self):
        # Create a frame to hold our task controls - like a section of our page
        task_frame = ttk.LabelFrame(self.task_tab, text="Task Management")
        task_frame.pack(fill="both", expand=1, padx=10, pady=10)
        
        # Create entry fields for task information - like little boxes to type in
        ttk.Label(task_frame, text="Task Title:").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        self.task_title_entry = ttk.Entry(task_frame, width=30)
        self.task_title_entry.grid(row=0, column=1, padx=5, pady=5)
        
        ttk.Label(task_frame, text="Description:").grid(row=1, column=0, padx=5, pady=5, sticky="w")
        self.task_desc_entry = ttk.Entry(task_frame, width=30)
        self.task_desc_entry.grid(row=1, column=1, padx=5, pady=5)
        
        # Create buttons for task actions - like control buttons on our robot
        add_task_btn = ttk.Button(task_frame, text="Add Task", command=self.add_task)
        add_task_btn.grid(row=2, column=0, padx=5, pady=5)

        delete_task_btn = ttk.Button(task_frame, text="Delete Task", command=self.delete_task)
        delete_task_btn.grid(row=2, column=2, padx=5, pady=5)
        
        complete_task_btn = ttk.Button(task_frame, text="Complete Task", command=self.complete_task)
        complete_task_btn.grid(row=2, column=1, padx=5, pady=5)
        
        # Create a listbox to show all our tasks - like a display screen on our robot
        ttk.Label(task_frame, text="Task List:").grid(row=3, column=0, padx=5, pady=5, sticky="w")
        self.task_listbox = tk.Listbox(task_frame, width=50, height=10)
        self.task_listbox.grid(row=4, column=0, columnspan=2, padx=5, pady=5)
        
        # Create a button to save tasks - like a memory button on our robot
        save_tasks_btn = ttk.Button(task_frame, text="Save Tasks to JSON", command=self.save_tasks)
        save_tasks_btn.grid(row=5, column=0, padx=5, pady=5)
        
        # Create a button to load tasks - like a recall button on our robot
        load_tasks_btn = ttk.Button(task_frame, text="Load Tasks from JSON", command=self.load_tasks)
        load_tasks_btn.grid(row=5, column=1, padx=5, pady=5)
        
        # Create buttons for database operations
        save_to_db_btn = ttk.Button(task_frame, text="Save to Database", command=self.save_tasks_to_db)
        save_to_db_btn.grid(row=6, column=0, padx=5, pady=5)
        
        load_from_db_btn = ttk.Button(task_frame, text="Load from Database", command=self.load_tasks_from_db)
        load_from_db_btn.grid(row=6, column=1, padx=5, pady=5)
        
        # Load tasks from the database when the app starts
        self.load_tasks_from_db()
    
    # This method sets up all the controls for the File Management tab
    def setup_file_tab(self):
        # Create a frame to hold our file controls - like another section of our page
        file_frame = ttk.LabelFrame(self.file_tab, text="File Organization")
        file_frame.pack(fill="both", expand=1, padx=10, pady=10)
        
        # Create a button to select a folder to watch - like a scanner button on our robot
        select_folder_btn = ttk.Button(file_frame, text="Select Folder to Watch", command=self.select_folder)
        select_folder_btn.grid(row=0, column=0, padx=5, pady=5)
        
        # Create a label to show the selected folder - like a display screen
        self.folder_label = ttk.Label(file_frame, text="No folder selected")
        self.folder_label.grid(row=0, column=1, padx=5, pady=5)
        
        # Create a button to organize files - like a "clean up" button on our robot
        organize_btn = ttk.Button(file_frame, text="Organize Files by Extension", command=self.organize_files)
        organize_btn.grid(row=1, column=0, columnspan=2, padx=5, pady=5)
        
        # Create a section for automation rules - like programming our robot to do tasks automatically
        automation_frame = ttk.LabelFrame(self.file_tab, text="Folder Automation")
        automation_frame.pack(fill="both", expand=1, padx=10, pady=10)
        
        # Create entry fields for automation rules
        ttk.Label(automation_frame, text="File Pattern:").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        self.pattern_entry = ttk.Entry(automation_frame, width=30)
        self.pattern_entry.grid(row=0, column=1, padx=5, pady=5)
        self.pattern_entry.insert(0, "*.txt")  # Default pattern for text files
        
        # Create a button to start watching the folder
        start_watching_btn = ttk.Button(automation_frame, text="Start Watching Folder", command=self.start_folder_watcher)
        start_watching_btn.grid(row=1, column=0, columnspan=2, padx=5, pady=5)
        
        # Create a label to show the automation status
        self.automation_status = ttk.Label(automation_frame, text="Automation not active")
        self.automation_status.grid(row=2, column=0, columnspan=2, padx=5, pady=5)
    
    # This method sets up all the controls for the Scheduling tab
    def setup_schedule_tab(self):
        # Create a frame to hold our scheduling controls
        schedule_frame = ttk.LabelFrame(self.schedule_tab, text="Task Scheduling")
        schedule_frame.pack(fill="both", expand=1, padx=10, pady=10)
        
        # Create a dropdown to select a task to schedule
        ttk.Label(schedule_frame, text="Select Task:").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        self.task_dropdown_var = tk.StringVar()
        self.task_dropdown = ttk.Combobox(schedule_frame, textvariable=self.task_dropdown_var, state="readonly")
        self.task_dropdown.grid(row=0, column=1, padx=5, pady=5)
        
        # Create an entry for the time to schedule the task
        ttk.Label(schedule_frame, text="Time (HH:MM):").grid(row=1, column=0, padx=5, pady=5, sticky="w")
        self.time_entry = ttk.Entry(schedule_frame, width=10)
        self.time_entry.grid(row=1, column=1, padx=5, pady=5, sticky="w")
        self.time_entry.insert(0, "08:00")  # Default time
        
        # Create a button to schedule the task
        schedule_btn = ttk.Button(schedule_frame, text="Schedule Task", command=self.schedule_task)
        schedule_btn.grid(row=2, column=0, columnspan=2, padx=5, pady=5)
        
        # Create a listbox to show scheduled tasks
        ttk.Label(schedule_frame, text="Scheduled Tasks:").grid(row=3, column=0, padx=5, pady=5, sticky="w")
        self.schedule_listbox = tk.Listbox(schedule_frame, width=50, height=10)
        self.schedule_listbox.grid(row=4, column=0, columnspan=2, padx=5, pady=5)
        
        # Create a button to start the scheduler
        start_scheduler_btn = ttk.Button(schedule_frame, text="Start Scheduler", command=self.start_scheduler)
        start_scheduler_btn.grid(row=5, column=0, columnspan=2, padx=5, pady=5)
        
        # Create a label to show the scheduler status
        self.scheduler_status = ttk.Label(schedule_frame, text="Scheduler not running")
        self.scheduler_status.grid(row=6, column=0, columnspan=2, padx=5, pady=5)
        
        # Update the task dropdown when the tab is selected
        self.tab_control.bind("<<NotebookTabChanged>>", self.on_tab_changed)
    
    # This method is called when a tab is selected
    def on_tab_changed(self, event):
        # Check if the schedule tab is selected
        if self.tab_control.index("current") == 2:  # Schedule tab is index 2
            # Update the task dropdown with current tasks
            self.update_task_dropdown()
            # Update the schedule listbox
            self.update_schedule_listbox()
    
    # This method updates the task dropdown with current tasks
    def update_task_dropdown(self):
        # Get all tasks from the task manager
        tasks = self.task_manager.list_tasks()
        
        # Create a list of task titles
        task_titles = [task.title for task in tasks]
        
        # Update the dropdown values
        self.task_dropdown['values'] = task_titles
        
        # Select the first task if available
        if task_titles:
            self.task_dropdown.current(0)
    
    # This method updates the schedule listbox with scheduled tasks
    def update_schedule_listbox(self):
        # Clear the current list
        self.schedule_listbox.delete(0, tk.END)
        
        # Add each scheduled task to the listbox
        for task_name, time in self.task_scheduler.scheduled_tasks.items():
            self.schedule_listbox.insert(tk.END, f"{task_name} - {time}")
    
    # This method is called when the Schedule Task button is clicked
    def schedule_task(self):
        # Get the selected task title
        task_title = self.task_dropdown_var.get()
        
        # Check if a task is selected
        if not task_title:
            messagebox.showerror("Error", "Please select a task to schedule!")
            return
        
        # Get the time from the entry field
        schedule_time = self.time_entry.get()
        
        # Check if the time is valid (simple check for HH:MM format)
        if not re.match(r"^\d{2}:\d{2}$", schedule_time):
            messagebox.showerror("Error", "Please enter a valid time in HH:MM format!")
            return
        
        # Find the task object with the matching title
        selected_task = None
        for task in self.task_manager.list_tasks():
            if task.title == task_title:
                selected_task = task
                break
        
        # Check if the task was found
        if not selected_task:
            messagebox.showerror("Error", "Task not found!")
            return
        
        # Create a function that will be called when the task is scheduled
        def scheduled_action():
            # Mark the task as completed
            selected_task.completed = True
            # Update the task listbox (must use after to run in the main thread)
            self.root.after(0, self.update_task_list)
            # Show a message (must use after to run in the main thread)
            self.root.after(0, lambda: messagebox.showinfo("Scheduled Task", f"Task '{task_title}' has been completed!"))
        
        # Add the task to the scheduler
        self.task_scheduler.add_scheduled_task(scheduled_action, schedule_time)
        
        # Update the schedule listbox
        self.update_schedule_listbox()
        
        # Show a success message
        messagebox.showinfo("Success", f"Task '{task_title}' scheduled for {schedule_time}!")
    
    # This method is called when the Start Scheduler button is clicked
    def start_scheduler(self):
        # Check if the scheduler is already running
        if hasattr(self, 'scheduler_thread') and self.scheduler_thread.is_alive():
            messagebox.showinfo("Info", "Scheduler is already running!")
            return
        
        # Create a thread to run the scheduler
        self.scheduler_thread = threading.Thread(target=self.task_scheduler.start_scheduler)
        # Set the thread as a daemon so it stops when the main program stops
        self.scheduler_thread.daemon = True
        # Start the thread
        self.scheduler_thread.start()
        
        # Update the scheduler status
        self.scheduler_status.config(text="Scheduler is running")
        
        # Show a success message
        messagebox.showinfo("Success", "Scheduler started successfully!")

    # This method is called when the Add Task button is clicked
    def add_task(self):
        # Get the task title and description from the entry fields
        title = self.task_title_entry.get()
        description = self.task_desc_entry.get()
        
        # Check if the title is empty (we need at least a title for our task)
        if not title:
            messagebox.showerror("Error", "Task title cannot be empty!")
            return
        
        # Create a new Task object and add it to our task manager
        new_task = Task(title=title, description=description)
        self.task_manager.add_task(new_task)
        
        # Update the task listbox to show the new task
        self.update_task_list()
        
        # Clear the entry fields for the next task
        self.task_title_entry.delete(0, tk.END)
        self.task_desc_entry.delete(0, tk.END)
    
    # This method is called when the Delete Task button is clicked
    def delete_task(self):
    
        # Get the selected task index from the listbox
        selected_index = self.task_listbox.curselection()

        if not selected_index:
            messagebox.showerror("Error", "Please select a task to delete!")
            return
        
        # Fetch that task from the task manager
        task = self.task_manager.list_tasks()[selected_index[0]]

        confirm = messagebox.askyesno("Confirm Delete", f"Are you sure you want to delete the task `{task.title}`?")
        if not confirm:
            return
        
        # Remove the task from the task maanger
        self.task_manager.remove_task(task)

        try:
            with self.storage.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "DELETE FROM tasks WHERE title = ? AND description = ?",
                    (task.title, task.description)
                )
                conn.commit()
        except Exception as e:
            messagebox.showerror("Error", f"Failed to delete task from database: {e}")
        
        self.update_task_list()
      
    
    # This method updates the task listbox with all tasks from the task manager
    def update_task_list(self):
        # Clear the current list
        self.task_listbox.delete(0, tk.END)
        
        # Add each task to the listbox
        for i, task in enumerate(self.task_manager.list_tasks()):
            status = "✓" if task.completed else "□"
            self.task_listbox.insert(tk.END, f"{status} {task.title} - {task.description}")
    
    # This method is called when the Complete Task button is clicked
    def complete_task(self):
        # Get the selected task index
        selected_index = self.task_listbox.curselection()
        
        # Check if a task is selected
        if not selected_index:
            messagebox.showerror("Error", "Please select a task to complete!")
            return
        
        # Mark the task as completed
        self.task_manager.complete_tasks(selected_index[0])
        
        # Update the task listbox
        self.update_task_list()
        
    
    # This method is called when the Save Tasks button is clicked
    def save_tasks(self):
        # Use DataProcessor to save tasks to a JSON file
        DataProcessor.save_tasks_json(
            [task.dict() for task in self.task_manager.list_tasks()], 
            "tasks.json"
        )
        
        # Show a success message
        messagebox.showinfo("Success", "Tasks saved to tasks.json!")
    
    # This method is called when the Load Tasks button is clicked
    def load_tasks(self):
        # Use DataProcessor to load tasks from a JSON file
        tasks_data = DataProcessor.load_tasks_json("tasks.json")
        
        # Clear current tasks
        self.task_manager = TaskManager()
        
        # Add each loaded task to the task manager
        for task_data in tasks_data:
            self.task_manager.add_task(Task(**task_data))
        
        # Update the task listbox
        self.update_task_list()
        
        # Show a success message
        messagebox.showinfo("Success", f"Loaded {len(tasks_data)} tasks from tasks.json!")
    
    # This method is called when the Select Folder button is clicked
    def select_folder(self):
        # Open a dialog to let the user pick a folder
        folder_path = filedialog.askdirectory(title="Select Folder to Watch")
        
        # Check if the user selected a folder
        if folder_path:
            # Create a FileManager for the selected folder
            self.file_manager = FileManager(folder_path)
            
            # Update the folder label
            self.folder_label.config(text=folder_path)
            
            # Show a success message
            messagebox.showinfo("Success", f"Now watching folder: {folder_path}")
    
    # This method is called when the Organize Files button is clicked
    def organize_files(self):
        # Check if a folder has been selected
        if not self.file_manager:
            messagebox.showerror("Error", "Please select a folder first!")
            return
        
        # Use the FileManager to organize files by extension
        self.file_manager.organize_by_extension()
        
        # Show a success message
        messagebox.showinfo("Success", "Files organized by extension!")
    
    # This method is called when the Start Watching Folder button is clicked
    def start_folder_watcher(self):
        # Check if a folder has been selected
        if not self.file_manager:
            messagebox.showerror("Error", "Please select a folder first!")
            return
        
        # Get the pattern from the entry field
        pattern_text = self.pattern_entry.get()
        
        # Create a pattern object that can match file paths
        class PatternMatcher:
            def __init__(self, pattern):
                # Convert glob pattern to regex pattern (*.txt becomes .*\.txt$)
                regex_pattern = pattern.replace(".", "\\.").replace("*", ".*") + "$"
                self.pattern = re.compile(regex_pattern)
            
            def match(self, path):
                # Check if the file path matches our pattern
                return self.pattern.search(path) is not None
        
        # Create a pattern matcher with our pattern
        pattern = PatternMatcher(pattern_text)
        
        # Define what happens when a matching file is detected
        def auto_organize_action(path):
            # Only organize if the path is a file (not a folder)
            if os.path.isfile(path):
                # Use our file manager to organize files
                self.file_manager.organize_by_extension()
                # Show a message in the GUI (must use after to run in the main thread)
                self.root.after(0, lambda: self.automation_status.config(
                    text=f"Organized files after change to: {os.path.basename(path)}"
                ))
        
        # Create an automation rule
        rule = AutomationRule(pattern, auto_organize_action)
        
        # Create a folder watcher with our rule
        self.folder_watcher = FolderWatcher([rule])
        
        # Create an observer to watch the folder
        self.observer = Observer()
        self.observer.schedule(self.folder_watcher, str(self.file_manager.watch_folder), recursive=False)
        
        # Start the observer in a separate thread
        self.observer.start()
        
        # Update the automation status
        self.automation_status.config(text=f"Watching folder for {pattern_text} files")
        
        # Show a success message
        messagebox.showinfo("Success", f"Now watching folder for {pattern_text} files!")
    
    # This method is called when the window is closed
    def on_closing(self):
        # Stop the observer if it's running
        if hasattr(self, 'observer') and self.observer.is_alive():
            self.observer.stop()
            self.observer.join()
        
        # Close the window
        self.root.destroy()

    # This method is called when the Save to Database button is clicked
    def save_tasks_to_db(self):
        # Get a connection to the database
        with self.storage.get_connection() as conn:
            # Create a cursor to execute SQL commands
            cursor = conn.cursor()
            
            # Clear the existing tasks table
            cursor.execute("DELETE FROM tasks")
            
            # Insert each task into the database
            for task in self.task_manager.list_tasks():
                cursor.execute(
                    "INSERT INTO tasks (title, description, completed) VALUES (?, ?, ?)",
                    (task.title, task.description, 1 if task.completed else 0)
                )
            
            # Commit the changes
            conn.commit()
        
        # Show a success message
        messagebox.showinfo("Success", "Tasks saved to database!")
    
    # This method is called when the Load from Database button is clicked
    def load_tasks_from_db(self):
        # Get a connection to the database
        with self.storage.get_connection() as conn:
            # Create a cursor to execute SQL commands
            cursor = conn.cursor()
            
            # Query all tasks from the database
            cursor.execute("SELECT title, description, completed FROM tasks")
            
            # Get all the results
            tasks_data = cursor.fetchall()
        
        # Clear current tasks
        self.task_manager = TaskManager()
        
        # Add each loaded task to the task manager
        for title, description, completed in tasks_data:
            self.task_manager.add_task(Task(
                title=title,
                description=description,
                completed=bool(completed)
            ))
        
        # Update the task listbox
        self.update_task_list()
        
        # Show a success message if tasks were loaded
        if tasks_data:
            messagebox.showinfo("Success", f"Loaded {len(tasks_data)} tasks from database!")

# This code runs when we start the program
if __name__ == "__main__":
    # Create the main window - like building the robot's body
    root = tk.Tk()
    # Set the window size - like deciding how big our robot should be
    root.geometry("600x400")
    # Create our GUI application - like bringing the robot to life
    app = AutomationGUI(root)
    # Set up what happens when the window is closed
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    # Start the main loop - like turning on the robot and letting it run
    root.mainloop()
```

## File: backend/src/main.py
```python
import tkinter as tk

from gui import AutomationGUI

def main():
    # Create the main window - like building the robot's body
    root = tk.Tk()
    
    # Set the window size - like deciding how big our robot should be
    root.geometry("800x600")
    
    # Create our GUI application - like bringing the robot to life
    app = AutomationGUI(root)
    
    # Set up what happens when the window is closed - like adding an "off" switch
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    
    # Start the main loop - like turning on the robot and letting it run
    # This keeps our app running until the user closes it
    root.mainloop()

# This special code checks if this file is being run directly (not imported by another file)
# It's like saying "only start the robot if someone presses the power button"
if __name__ == "__main__":
    # Call our main function to start the application
    main()
```

## File: backend/src/scheduler.py
```python
# Import a tool that helps us work with dates and times (like a digital calendar)
from datetime import datetime

# Import a special helper that lets us schedule tasks (like setting an alarm clock)
import schedule

# Import a tool that lets our program wait or sleep (like taking a short nap) 
import time

# Create a TaskScheduler class - think of it as an alarm clock for our program
class TaskScheduler():
    # When we create a new scheduler, we set up an empty list to store our alarms
    def __init__(self):
        # This is like a notebook where we write down all our scheduled tasks.
        self.scheduled_tasks = {}
    
    # This is how we add a new alarm to our clock
    def add_scheduled_task(self, task, schedule_time):
        # Tell the schedule tool to run our task every day at the specific time
        # (Like telling your alarm: "Wake me up at 7:00 AM every day")

        schedule.every().day.at(schedule_time).do(task)
        
        # Write down this task in our notebook so we remember it
        # We use the task's name as a label (like writing "Wake up" on your alarm)
        self.scheduled_tasks[task.__name__] = schedule_time
    
    # This method runs all our scheduled tasks (like letting all alarms ring when it's time)
    def run_pending_tasks(self):
        # Check if any alarms need to ring right now
        schedule.run_pending()
    
    # This method keeps checking our alarms forever (like a real alarm clock that's always on)
    def start_scheduler(self):
        # Keep doing this forever (or until someone stops the program)
        while True:
            # Check if any tasks need to run
            self.run_pending_tasks()
            # Wait a little bit before checking again (like hitting snooze for 1 second)
            time.sleep(1)
```

## File: backend/src/storage.py
```python
# Import sqlite3 - it's like bringing a special toolbox that helps us store information in a mini-database
import sqlite3
# Import contextmanager - it's like a helper that makes sure we clean up after ourselves when using resources
from contextlib import contextmanager
import uuid

# Create a Storage class - think of it as a digital filing cabinet for our tasks
class Storage:
    # When we set up a new filing cabinet, we need to know where to put it
    def __init__(self, db_path: str):
        # Save the location of our filing cabinet (like writing the room number on a map)
        self.db_path = db_path
        # Call another method to set up the drawers in our filing cabinet
        self.init_db()

    # This method creates a special helper that makes sure we always close our filing cabinet when we're done
    @contextmanager
    def get_connection(self):
        # Open a connection to our filing cabinet (like unlocking it with a key)
        conn = sqlite3.connect(self.db_path)
        try:
            # Let the code that called this method use the connection (like letting someone use the cabinet)
            yield conn
        finally:
            # Always close the connection when done (like locking the cabinet when finished)
            conn.close()
    
    def increment_stat(self, key, amount=1):
        with self.get_connection() as conn:
            conn.execute("UPDATE stats SET value = value + ? WHERE key = ?", (amount, key))
            conn.commit()

    def get_stats(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT key, value FROM stats")
            return dict(cursor.fetchall())
        
    def get_recent_activities(self, activity_type="organization"):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, type, title, timestamp, status, due_date FROM activities WHERE type = ? ORDER BY timestamp DESC",
                            (activity_type,) 
            )
            return [dict(zip(["id", "type", "title", "timestamp", "status", "due_date"], row)) for row in cursor.fetchall()]
    
    def get_latest_tasks(self, activity_type="tasks"):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, type, title, timestamp, status, due_date FROM activities WHERE type = ? ORDER BY timestamp DESC",
                            (activity_type,) 
            )
            return [dict(zip(["id", "type", "title", "timestamp", "status", "due_date"], row)) for row in cursor.fetchall()]
        
    def add_activity(self, activity_data):
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # Check if the activities table exists
            cursor.execute("SELECT name from sqlite_master WHERE type='table' AND name='activities'")
            table_exists = cursor.fetchone() is not None
            
            if not table_exists:
                # Table doesn't exist, so we can't add the activity
                return False
            
            # Get the activity type
            activity_type = activity_data['type']
            
            # Count existing activities of the same type
            cursor.execute("SELECT COUNT(*) FROM activities WHERE type = ?", (activity_type,))
            count = cursor.fetchone()[0]
            
            # If we already have 4 activities of this type, delete the oldest one
            if count >= 4:
                cursor.execute("""
                    DELETE FROM activities 
                    WHERE id = (
                        SELECT id FROM activities 
                        WHERE type = ? 
                        ORDER BY timestamp ASC 
                        LIMIT 1
                    )
                """, (activity_type,))
            
            # Insert the new activity data
            conn.execute(
                "INSERT INTO activities (id, type, title, timestamp, status, due_date) VALUES (?, ?, ?, ?, ?, ?)",
                (
                    activity_data['id'],
                    activity_data['type'],
                    activity_data['title'],
                    activity_data['timestamp'],
                    activity_data['status'],
                    activity_data.get('due_date', None),
                )
            )

            conn.commit()
            return True

    # This method creates the structure of our filing cabinet if it doesn't exist yet
    def init_db(self):
        with self.get_connection() as conn:
            # First, check if the stats table exists
            cursor = conn.cursor()
            
            # Get the stats table first
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='stats'")
            stats_table_exists = cursor.fetchone() is not None

            if not stats_table_exists:
                # Create stats table
                conn.execute('''
                    CREATE TABLE stats (
                        key TEXT PRIMARY KEY,
                        value INTEGER DEFAULT 0
                    )              
                ''')

                for key in ["tasks_completed", "files_organized", "pending_tasks"]:
                    conn.execute("INSERT INTO stats (key, value) VALUES (?, 0)", (key,))
                
                # Commit immediately after creating the stats table
                conn.commit()
            
            # Getting the latest activity/task progress table
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='activities'")
            activities_table_exists = cursor.fetchone() is not None

            if not activities_table_exists:
                # Create activities table
                conn.execute('''
                    CREATE TABLE activities (
                        id TEXT PRIMARY KEY,
                        type TEXT NOT NULL,
                        title TEXT,
                        timestamp TEXT,
                        status TEXT,
                        due_date TEXT,
                        progress INTEGER DEFAULT 0
                    )       
                ''')

                conn.commit()

            # Check if due_date column exists in activities table
            if activities_table_exists:
                cursor.execute("PRAGMA table_info(activities)")
                columns = [col[1] for col in cursor.fetchall()]
                if "due_date" not in columns:
                    # Add due_date column if it doesn't exist
                    conn.execute("ALTER TABLE activities ADD COLUMN due_date TEXT")
                    conn.commit()

            # Getting the tasks table second
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='tasks'")
            table_exists = cursor.fetchone() is not None
            
            if not table_exists:
                # Create the table with UUID as TEXT primary key
                conn.execute('''
                    CREATE TABLE tasks (
                        id TEXT PRIMARY KEY,  
                        title TEXT NOT NULL,     
                        description TEXT,       
                        due_date TEXT,           
                        completed BOOLEAN DEFAULT 0, 
                        in_progress BOOLEAN DEFAULT 0,
                        pending BOOLEAN DEFAULT 1,
                        priority INTEGER DEFAULT 1
                    )
                ''')
                # Commit after creating the tasks table
                conn.commit()
        
            else:
                # Check if id column exists and is TEXT
                cursor.execute("PRAGMA table_info(tasks)")
                columns = cursor.fetchall()
                id_column = next((col for col in columns if col[1] == 'id'), None)
                
                # If id column doesn't exist or is not TEXT, we need to migrate
                if id_column is None or id_column[2] != 'TEXT':
                    # Create a new table with the correct schema
                    conn.execute('''
                        CREATE TABLE tasks_new (
                            id TEXT PRIMARY KEY,  
                            title TEXT NOT NULL,     
                            description TEXT,       
                            due_date TEXT,           
                            completed BOOLEAN DEFAULT 0, 
                            in_progress BOOLEAN DEFAULT 0,
                            pending BOOLEAN DEFAULT 1,
                            priority INTEGER DEFAULT 1
                        )
                    ''')
                    
                    # Copy data, generating UUIDs for existing records
                    cursor.execute("SELECT title, description, due_date, completed, in_progress, pending, priority FROM tasks")
                    rows = cursor.fetchall()
                    
                    for row in rows:
                        new_id = str(uuid.uuid4())
                        conn.execute(
                            "INSERT INTO tasks_new (id, title, description, due_date, completed, in_progress, pending, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                            (new_id, *row)
                        )
                    
                    # Replace the old table with the new one
                    conn.execute("DROP TABLE tasks")
                    conn.execute("ALTER TABLE tasks_new RENAME TO tasks")
```

## File: backend/src/task_manager.py
```python
# Import datetime module for handling dates and times
from datetime import datetime

# Import typing module for type hints
# List: for creating lists with specific types
# Optional: for fields that can be None
from typing import List, Optional

# Import BaseModel from pydantic for data validation
from pydantic import BaseModel

import uuid

# Define a Task class that inherits from BaseModel
# This provides automatic validation and serialization
class Task(BaseModel):
    id: Optional[str] = None # Database ID, null for new tasks
    
    # Required field: title of the task (must be a string)
    title: str
    
    # Optional field: description of the task (can be None)
    description: Optional[str] = None
    
    # Optional field: when the task is due (can be None)
    due_date: Optional[datetime] = None
    
    # Field with default value: whether task is completed
    # Defaults to False if not specified
    completed: bool = False
    
    # Field with default value: whether task is in progress
    # Defaults to False if not specified
    inProgress: bool = False
    
    # Field with default value: whether task is pending
    # Defaults to True if not specified
    pending: bool = True
    
    # Field with default value: task priority (1-5)
    # Defaults to 1 (lowest priority) if not specified
    priority: int = 1

class TaskManager():
    def __init__(self):
        self.tasks = []
    def add_task(self, task: Task):
        self.tasks.append(task)
    def remove_task(self, task: Task):
        self.tasks.remove(task)
    def list_tasks(self):
        return self.tasks
    def complete_tasks(self, task_index: int):
        if 0 <= task_index < len(self.tasks):
            self.tasks[task_index].completed = True
```

## File: backend/build.py
```python
import os
import sys
import subprocess
import shutil
import webview
from pathlib import Path

def build_frontend():
    """Build the frontend for production"""
    print("Building frontend...")
    try:
        # Get the absolute path to the frontend directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        frontend_path = os.path.join(os.path.dirname(current_dir), 'frontend')
        
        if not os.path.exists(frontend_path):
            print(f"Error: Frontend directory not found at {frontend_path}")
            sys.exit(1)
            
        # Store the current directory
        original_dir = os.getcwd()
        
        try:
            # Change to frontend directory
            os.chdir(frontend_path)
            
            # Build the frontend
            subprocess.run(['npm', 'run', 'build'], check=True)
            
        finally:
            # Always change back to the original directory
            os.chdir(original_dir)
            
    except subprocess.CalledProcessError as e:
        print(f"Error building frontend: {e}")
        sys.exit(1)

def create_dist():
    """Create distribution directory"""
    if os.path.exists('dist'):
        shutil.rmtree('dist')
    os.makedirs('dist')

def copy_files():
    """Copy necessary files to dist directory"""
    # Get the absolute path to the frontend directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_path = os.path.join(os.path.dirname(current_dir), 'frontend')
    
    # Copy frontend build
    frontend_dist = os.path.join(frontend_path, 'dist')
    if not os.path.exists(frontend_dist):
        print("Error: Frontend build not found. Run build_frontend() first.")
        sys.exit(1)
        
    shutil.copytree(frontend_dist, 'dist/frontend')
    
    # Copy Python files
    shutil.copytree('src', 'dist/src')
    
    # Copy data directory
    shutil.copytree('data', 'dist/data')
    
    # Copy requirements
    shutil.copy('requirements.txt', 'dist/')

def create_main():
    """Create the main entry point for the packaged application"""
    main_content = '''
import webview
import os
import sys

def get_html_path():
    if getattr(sys, 'frozen', False):
        # Running in PyInstaller bundle
        return os.path.join(sys._MEIPASS, 'frontend', 'index.html')
    else:
        # Running in normal Python environment
        return os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend', 'index.html')

def main():
    window = webview.create_window(
        'Chronos',
        get_html_path(),
        width=1200,
        height=800,
        resizable=True,
        min_size=(800, 600)
    )
    webview.start()

if __name__ == '__main__':
    main()
'''
    with open('dist/main.py', 'w') as f:
        f.write(main_content)

def main():
    # Build frontend
    build_frontend()
    
    # Create distribution directory
    create_dist()
    
    # Copy files
    copy_files()
    
    # Create main entry point
    create_main()
    
    print("Build complete! Distribution files are in the 'dist' directory.")
    print("To run the application:")
    print("1. cd dist")
    print("2. pip install -r requirements.txt")
    print("3. python main.py")

if __name__ == '__main__':
    main()
```

## File: frontend/public/vite.svg
```
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>
```

## File: frontend/src/assets/react.svg
```
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="35.93" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 228"><path fill="#00D8FF" d="M210.483 73.824a171.49 171.49 0 0 0-8.24-2.597c.465-1.9.893-3.777 1.273-5.621c6.238-30.281 2.16-54.676-11.769-62.708c-13.355-7.7-35.196.329-57.254 19.526a171.23 171.23 0 0 0-6.375 5.848a155.866 155.866 0 0 0-4.241-3.917C100.759 3.829 77.587-4.822 63.673 3.233C50.33 10.957 46.379 33.89 51.995 62.588a170.974 170.974 0 0 0 1.892 8.48c-3.28.932-6.445 1.924-9.474 2.98C17.309 83.498 0 98.307 0 113.668c0 15.865 18.582 31.778 46.812 41.427a145.52 145.52 0 0 0 6.921 2.165a167.467 167.467 0 0 0-2.01 9.138c-5.354 28.2-1.173 50.591 12.134 58.266c13.744 7.926 36.812-.22 59.273-19.855a145.567 145.567 0 0 0 5.342-4.923a168.064 168.064 0 0 0 6.92 6.314c21.758 18.722 43.246 26.282 56.54 18.586c13.731-7.949 18.194-32.003 12.4-61.268a145.016 145.016 0 0 0-1.535-6.842c1.62-.48 3.21-.974 4.76-1.488c29.348-9.723 48.443-25.443 48.443-41.52c0-15.417-17.868-30.326-45.517-39.844Zm-6.365 70.984c-1.4.463-2.836.91-4.3 1.345c-3.24-10.257-7.612-21.163-12.963-32.432c5.106-11 9.31-21.767 12.459-31.957c2.619.758 5.16 1.557 7.61 2.4c23.69 8.156 38.14 20.213 38.14 29.504c0 9.896-15.606 22.743-40.946 31.14Zm-10.514 20.834c2.562 12.94 2.927 24.64 1.23 33.787c-1.524 8.219-4.59 13.698-8.382 15.893c-8.067 4.67-25.32-1.4-43.927-17.412a156.726 156.726 0 0 1-6.437-5.87c7.214-7.889 14.423-17.06 21.459-27.246c12.376-1.098 24.068-2.894 34.671-5.345a134.17 134.17 0 0 1 1.386 6.193ZM87.276 214.515c-7.882 2.783-14.16 2.863-17.955.675c-8.075-4.657-11.432-22.636-6.853-46.752a156.923 156.923 0 0 1 1.869-8.499c10.486 2.32 22.093 3.988 34.498 4.994c7.084 9.967 14.501 19.128 21.976 27.15a134.668 134.668 0 0 1-4.877 4.492c-9.933 8.682-19.886 14.842-28.658 17.94ZM50.35 144.747c-12.483-4.267-22.792-9.812-29.858-15.863c-6.35-5.437-9.555-10.836-9.555-15.216c0-9.322 13.897-21.212 37.076-29.293c2.813-.98 5.757-1.905 8.812-2.773c3.204 10.42 7.406 21.315 12.477 32.332c-5.137 11.18-9.399 22.249-12.634 32.792a134.718 134.718 0 0 1-6.318-1.979Zm12.378-84.26c-4.811-24.587-1.616-43.134 6.425-47.789c8.564-4.958 27.502 2.111 47.463 19.835a144.318 144.318 0 0 1 3.841 3.545c-7.438 7.987-14.787 17.08-21.808 26.988c-12.04 1.116-23.565 2.908-34.161 5.309a160.342 160.342 0 0 1-1.76-7.887Zm110.427 27.268a347.8 347.8 0 0 0-7.785-12.803c8.168 1.033 15.994 2.404 23.343 4.08c-2.206 7.072-4.956 14.465-8.193 22.045a381.151 381.151 0 0 0-7.365-13.322Zm-45.032-43.861c5.044 5.465 10.096 11.566 15.065 18.186a322.04 322.04 0 0 0-30.257-.006c4.974-6.559 10.069-12.652 15.192-18.18ZM82.802 87.83a323.167 323.167 0 0 0-7.227 13.238c-3.184-7.553-5.909-14.98-8.134-22.152c7.304-1.634 15.093-2.97 23.209-3.984a321.524 321.524 0 0 0-7.848 12.897Zm8.081 65.352c-8.385-.936-16.291-2.203-23.593-3.793c2.26-7.3 5.045-14.885 8.298-22.6a321.187 321.187 0 0 0 7.257 13.246c2.594 4.48 5.28 8.868 8.038 13.147Zm37.542 31.03c-5.184-5.592-10.354-11.779-15.403-18.433c4.902.192 9.899.29 14.978.29c5.218 0 10.376-.117 15.453-.343c-4.985 6.774-10.018 12.97-15.028 18.486Zm52.198-57.817c3.422 7.8 6.306 15.345 8.596 22.52c-7.422 1.694-15.436 3.058-23.88 4.071a382.417 382.417 0 0 0 7.859-13.026a347.403 347.403 0 0 0 7.425-13.565Zm-16.898 8.101a358.557 358.557 0 0 1-12.281 19.815a329.4 329.4 0 0 1-23.444.823c-7.967 0-15.716-.248-23.178-.732a310.202 310.202 0 0 1-12.513-19.846h.001a307.41 307.41 0 0 1-10.923-20.627a310.278 310.278 0 0 1 10.89-20.637l-.001.001a307.318 307.318 0 0 1 12.413-19.761c7.613-.576 15.42-.876 23.31-.876H128c7.926 0 15.743.303 23.354.883a329.357 329.357 0 0 1 12.335 19.695a358.489 358.489 0 0 1 11.036 20.54a329.472 329.472 0 0 1-11 20.722Zm22.56-122.124c8.572 4.944 11.906 24.881 6.52 51.026c-.344 1.668-.73 3.367-1.15 5.09c-10.622-2.452-22.155-4.275-34.23-5.408c-7.034-10.017-14.323-19.124-21.64-27.008a160.789 160.789 0 0 1 5.888-5.4c18.9-16.447 36.564-22.941 44.612-18.3ZM128 90.808c12.625 0 22.86 10.235 22.86 22.86s-10.235 22.86-22.86 22.86s-22.86-10.235-22.86-22.86s10.235-22.86 22.86-22.86Z"></path></svg>
```

## File: frontend/src/components/ui/badge.tsx
```typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-gray-200/50 text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
```

## File: frontend/src/components/ui/button.tsx
```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-black text-white hover:bg-black/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-gray-200 bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

## File: frontend/src/components/ui/calendar.tsx
```typescript
import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "./button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
```

## File: frontend/src/components/ui/card.tsx
```typescript
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-white text-card-foreground rounded-lg border border-gray-300",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
```

## File: frontend/src/components/ui/checkbox.tsx
```typescript
import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
```

## File: frontend/src/components/ui/dialog.tsx
```typescript
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
```

## File: frontend/src/components/ui/dropdown-menu.tsx
```typescript
import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none bg-white border border-gray-200 hover:bg-gray-500 focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border border-gray-200 bg-white p-1 text-popover-foreground shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-500 hover:text-white focus:bg-gray-200/50 focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-gray-500 hover:text-white focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-gray-500 hover:text-white focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-gray-200", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
```

## File: frontend/src/components/ui/input.tsx
```typescript
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

## File: frontend/src/components/ui/label.tsx
```typescript
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
```

## File: frontend/src/components/ui/progress.tsx
```typescript
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
```

## File: frontend/src/components/ui/select.tsx
```typescript
import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:border-gray-200 focus:bg-white data-[state=open]:border-gray-200 data-[state=open]:bg-white disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
```

## File: frontend/src/components/ui/separator.tsx
```typescript
import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
```

## File: frontend/src/components/ui/switch.tsx
```typescript
import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
```

## File: frontend/src/components/ui/tabs.tsx
```typescript
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-gray-100 text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-sm border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "text-gray-700 hover:text-gray-800",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:outline-1",
        "data-[state=active]:shadow-sm data-[state=active]:bg-white data-[state=active]:text-black",
        "dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/50",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
```

## File: frontend/src/components/ui/textarea.tsx
```typescript
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
```

## File: frontend/src/components/Dashboard.tsx
```typescript
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { 
  CheckCircle, 
  FolderOpen, 
  AlertCircle, 
  FileText, 
  BarChart2, 
  Clock, 
  Lightbulb 
} from "lucide-react"
import { Button } from './ui/button';
import { useEffect, useState } from "react";
import { Activity, api, DashboardStats } from "@/lib/api";

// Tips to show when there's empty space
const taskTips = [
  "Break large tasks into smaller, manageable subtasks",
  "Set realistic deadlines for your tasks",
  "Prioritize tasks based on urgency and importance",
  "Review completed tasks to improve your workflow",
  "Use labels or tags to categorize similar tasks",
]

const organizationTips = [
  "Organize files by project or category for easier access",
  "Use consistent naming conventions for your files",
  "Regularly clean up temporary files to save space",
  "Back up important files to prevent data loss",
  "Use search filters to quickly find specific files",
]

// Get random tips
const getRandomTip = (tips: string[]) => {
  return tips[Math.floor(Math.random() * tips.length)]
}

const Dashboard = ({ setActiveTab } : { setActiveTab: (tab: string) => void }) => {
  const [statistics, setStatistics] = useState<DashboardStats>({
    tasks_completed: 0,
    files_organized: 0,
    pending_tasks: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [latestTasks, setLatestTasks] = useState<Activity[]>([]);

  useEffect(() => {
    fetchStatistics();
    fetchActivities();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const result = await api.getDashboardStats();
      setStatistics(result);
      setError(null);
    } catch (error) {
      console.log(`There has been an error with fetching the dashboard statistics: ${error}`);
      setError("Failed to fetch dashboard stats. Check console for further information.");
    } finally {
      setLoading(false);
    }
  }

  const fetchActivities = async() => {
    try {
      const activities = await api.get_recent_activities();
      const tasks = await api.get_latest_tasks();
      setRecentActivities(activities);
      setLatestTasks(tasks);
    } catch (error) {
      console.error('Error fetching dashboard activities and tasks', error);
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8 dark:text-white">Loading dashboard stats...</div>;
  }

  if (error) {
    return <div className="flex justify-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<CheckCircle className="h-8 w-8 text-green-500" />}
          title="Tasks Completed"
          value={statistics.tasks_completed.toString()}
          description="lifetime"
        />
        <StatCard
          icon={<FolderOpen className="h-8 w-8 text-amber-500" />}
          title="Files Organized"
          value={statistics.files_organized.toString()}
          description="lifetime"
        />
        <StatCard
          icon={<AlertCircle className="h-8 w-8 text-red-500" />}
          title="Pending Tasks"
          value={statistics.pending_tasks.toString()}
          description="get working boy"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="dark:text-white">Recent Activity</CardTitle>
                <CardDescription className="dark:text-gray-400">Your latest activities</CardDescription>
              </div>
            </div>
          </CardHeader>
          {recentActivities.length === 0 ? (
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium dark:text-white">No recent activity</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                  Your recent activities will appear here once you start using the application.
                </p>
                <div className="mt-6 flex gap-2">
                  <Button onClick={() => setActiveTab("tasks")} variant="outline" size="sm" className="dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:border-gray-600">
                    Create a Task
                  </Button>
                  <Button onClick={() => setActiveTab("files")} variant="outline" size="sm" className="dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:border-gray-600">
                    Organize Files
                  </Button>
                </div>
              </div>
            </CardContent>
          ) : (
            <CardContent>
              <div className="space-y-4">
                {/* Activity items */}
                {recentActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}

                {/* Tip card to fill space when there's only one item */}
                {recentActivities.length < 3 && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">Pro Tip</h4>
                        <p className="text-xs text-blue-600 dark:text-blue-200 mt-1">{getRandomTip(taskTips)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="dark:text-white">Task Progress</CardTitle>
                <CardDescription className="dark:text-gray-400">Current status of your tasks</CardDescription>
              </div>
            </div>
          </CardHeader>
          {latestTasks.length === 0 ? (
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BarChart2 className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium dark:text-white">No tasks in progress</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                  Create tasks to track your progress and see them here.
                </p>
                <Button onClick={() => setActiveTab("tasks")} className="mt-6 dark:bg-white dark:text-black" size="sm">
                  Create a Task
                </Button>
              </div>
            </CardContent>
          ) : (
            <CardContent>
              <div className="space-y-4">
                {/* Task items */}
                {latestTasks.map((task) => (
                  <TaskStatusItem key={task.id} task={task} />
                ))}

                {/* Organization tip when there are few tasks */}
                {latestTasks.length < 3 && (
                  <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-700 dark:text-amber-300">Organization Tip</h4>
                        <p className="text-xs text-amber-600 dark:text-amber-200 mt-1">
                          {getRandomTip(organizationTips)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

function StatCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode
  title: string
  value: string
  description?: string
}) {
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold dark:text-white">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
            )}
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ activity }: { activity: Activity }) {
  // Format the timestamp
  const formatDate = (timestamp: string) => {
    if (!timestamp) return '';
    
    // For timestamps that include time, we want to preserve the local time
    // but avoid any date shifting due to timezone
    const date = new Date(timestamp);
    
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  }

  // Get icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task_created":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case "task_completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "task_started":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "tasks":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case "organization":
        return <FolderOpen className="h-4 w-4 text-purple-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(activity.timestamp)}</p>
      </div>
    </div>
  )
}

function TaskStatusItem({ task }: { task: Activity }) {
  const [animationFrame, setAnimationFrame] = useState(0)

  // Create pulsing animation for in-progress tasks
  useEffect(() => {
    let animationId: number

    if (task.status === "In Progress") {
      const animate = () => {
        setAnimationFrame((prev) => (prev + 0.5) % 60)
        animationId = requestAnimationFrame(animate)
      }

      animationId = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(animationId)
    }
  }, [task.status])

  // Get status indicator based on task status
  const getStatusIndicator = () => {
    switch (task.status) {
      case "Completed":
        return (
          <div className="relative flex items-center justify-center w-5 h-5">
            <div className="absolute w-5 h-5 rounded-full bg-green-500 opacity-20"></div>
            <div className="absolute w-4 h-4 rounded-full bg-green-500 opacity-40"></div>
            <div className="absolute w-3 h-3 rounded-full bg-green-500 opacity-60"></div>
            <div className="absolute w-2 h-2 rounded-full bg-green-500 opacity-80"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.9)]"></div>
          </div>
        )
      case "In Progress":
        return (
          <div className="relative flex items-center justify-center w-5 h-5">
            {/* Radar-like ripple effect */}
            <div
              className="absolute w-5 h-5 rounded-full bg-blue-500 opacity-10 transform scale-100"
              style={{
                transform: `scale(${1 + (animationFrame % 40) / 40})`,
                opacity: 0.2 - ((animationFrame % 40) / 40) * 0.2,
              }}
            ></div>
            <div
              className="absolute w-5 h-5 rounded-full bg-blue-500 opacity-20 transform scale-100"
              style={{
                transform: `scale(${1 + ((animationFrame + 20) % 40) / 40})`,
                opacity: 0.3 - (((animationFrame + 20) % 40) / 40) * 0.3,
              }}
            ></div>
            <div className="absolute w-3 h-3 rounded-full bg-blue-500 opacity-40"></div>
            <div className="absolute w-2 h-2 rounded-full bg-blue-500 opacity-60"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.9)]"></div>
          </div>
        )
      default:
        return (
          <div className="relative flex items-center justify-center w-5 h-5">
            <div className="absolute w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 opacity-30"></div>
            <div className="absolute w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 opacity-40"></div>
            <div className="absolute w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 opacity-60"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"></div>
          </div>
        )
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    // Handle timezone issue by parsing the date in UTC
    // First split the date string in case it has time information
    const datePart = dateString.split('T')[0].split(' ')[0];
    // Parse the date parts to create a UTC date
    const [year, month, day] = datePart.split('-').map(num => parseInt(num, 10));
    const date = new Date(Date.UTC(year, month - 1, day));
    
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC" // Force UTC to avoid timezone shifts
    }).format(date);
  }

  // Display either due date or creation timestamp
  const getDateDisplay = () => {
    if (task.due_date) {
      return `Due ${formatDate(task.due_date)}`;
    } else {
      return `Created ${formatDate(task.timestamp)}`;
    }
  }

  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <div>{getStatusIndicator()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
          {task.status} • {getDateDisplay()}
        </p>
      </div>
    </div>
  )
}

export default Dashboard
```

## File: frontend/src/components/Files.tsx
```typescript
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FolderOpen,
  FileText,
  Image,
  Film,
  Music,
  Archive,
  Code,
  Trash2,
  MoreVertical,
  RefreshCw,
  Search,
  ChevronRight,
  ChevronDown,
  Plus,
  AlertCircle,
  Pencil,
  Circle,
  CircleX,
} from "lucide-react"
import { api, FileSystemItem } from "../lib/api"

// Define types for our component
interface FileTypeInfo {
  id: number;
  extension: string[];
  category: string;
  icon: JSX.Element;
  color: string;
}

interface OrganizationRule {
  id: string;
  base_folder_directory: string;
  full_path: string;
  desired_folder_directory: string;
  folder_name: string;
  extensions: string[];
  enabled: boolean;
}

interface MisplacedFile extends FileSystemItem {
  current_folder: string;
  correct_folder: string;
  source_path: string;
  destination_path: string;
  icon?: JSX.Element;
}

interface EnhancedFileSystemItem extends FileSystemItem {
  icon?: JSX.Element;
}

// Helper function to normalize paths
const normalizePath = (path: string): string => {
  return path.replace(/\\/g, '/');
};

// Mock data for file types
const fileTypes: FileTypeInfo[] = [
  {
    id: 1,
    extension: [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff"],
    category: "Images",
    icon: <Image className="h-5 w-5" />,
    color: "bg-blue-500",
  },
  {
    id: 2,
    extension: [".doc", ".docx", ".pdf", ".txt", ".rtf", ".odt"],
    category: "Documents",
    icon: <FileText className="h-5 w-5" />,
    color: "bg-amber-500",
  },
  {
    id: 3,
    extension: [".mp4", ".avi", ".mov", ".mkv", ".wmv", ".flv"],
    category: "Videos",
    icon: <Film className="h-5 w-5" />,
    color: "bg-red-500",
  },
  {
    id: 4,
    extension: [".mp3", ".wav", ".flac", ".aac", ".ogg", ".wma"],
    category: "Audio",
    icon: <Music className="h-5 w-5" />,
    color: "bg-green-500",
  },
  {
    id: 5,
    extension: [".zip", ".rar", ".7z", ".tar", ".gz", ".bz2"],
    category: "Archives",
    icon: <Archive className="h-5 w-5" />,
    color: "bg-purple-500",
  },
  {
    id: 6,
    extension: [".js", ".py", ".html", ".css", ".java", ".cpp", ".php"],
    category: "Code",
    icon: <Code className="h-5 w-5" />,
    color: "bg-gray-500",
  },
]

export default function FileOrganizer() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [folderContents, setFolderContents] = useState<EnhancedFileSystemItem[]>([])
  const [expandedFolders, setExpandedFolders] = useState<string[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [isOrganizing, setIsOrganizing] = useState(false)
  const [organizingProgress, setOrganizingProgress] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [organizationRules, setOrganizationRules] = useState<OrganizationRule[]>([])
  const [showRuleDialog, setShowRuleDialog] = useState(false)
  const [showEditRuleDialog, setShowEditRuleDialog] = useState(false)
  const [newRule, setNewRule] = useState({
    folder_name: "",
    desired_folder_path: "",
    extensions: [] as string[],
  })
  const [misplacedFiles, setMisplacedFiles] = useState<MisplacedFile[]>([]);
  const [editingRule, setEditingRule] = useState<OrganizationRule | null>(null);

  const handleSelectFolder = async () => {
    try {
      const folderPath = await api.select_folder();
      
      if (folderPath) {
        setSelectedFolder(folderPath);

        scanFolder(folderPath);
      }
    } catch (error) {
      console.error("Error selecting folder:", error);
      alert("Error selecting folder. See console for details.");
    }
  }

  // Update the scanFolder function to add icons to files
  const scanFolder = async (folderPath: string) => {
    setIsScanning(true);
    
    try {
      // Get folder contents from API (Python backend or mock)
      const contents = await api.scan_folder(folderPath);
      
      if (contents && Array.isArray(contents)) {
        // Add icons to files based on their extension
        const contentsWithIcons = addIconsToFileItems(contents);
        setFolderContents(contentsWithIcons);
        // Find misplaced files based on organization rules
        findMisplacedFiles(contentsWithIcons, organizationRules);
      } else {
        console.warn("Received invalid folder contents", contents);
        // If we get invalid data, use an empty array
        setFolderContents([]);
      }
    } catch (error) {
      console.error("Error scanning folder:", error);
    } finally {
      setIsScanning(false);
    }
  }

  // Helper function to add icons to files recursively
  const addIconsToFileItems = (items: FileSystemItem[]): EnhancedFileSystemItem[] => {
    return items.map(item => {
      if (item.type === "folder" && item.children) {
        // Recursively process children for folders
        return {
          ...item,
          children: addIconsToFileItems(item.children)
        };
      } else if (item.type === "file") {
        // Add icon based on file extension
        const fileType = getFileTypeByExtension(item.extension || "");
        return {
          ...item,
          icon: fileType ? fileType.icon : <FileText className="h-4 w-4 text-gray-500" />
        };
      }
      return item as EnhancedFileSystemItem;
    });
  }

  // Helper function to get file type by extension
  const getFileTypeByExtension = (extension: string): FileTypeInfo | undefined => {
    if (!extension) return undefined;
    
    return fileTypes.find(type => 
      type.extension.includes(extension.toLowerCase())
    );
  }

  // Function to find misplaced files based on organization rules
  const findMisplacedFiles = (contents: FileSystemItem[], rules: OrganizationRule[]): void => {
    const misplaced: MisplacedFile[] = []

    // Helper function to check if a file should be in a different folder
    const checkFileLocation = (file: FileSystemItem, currentFolder: string) => {
      if (file.type === "file" && file.extension) {
        const matchingRule = rules.find(r => r.enabled && r.extensions.includes(file.extension))
        if (matchingRule && currentFolder !== matchingRule.folder_name) {
          return {
            ...file,
            current_folder: currentFolder,
            correct_folder: matchingRule.folder_name,
            source_path: file.path || '',
            destination_path: `${matchingRule.full_path}/${file.name}`
          }
        }
      }
      return null
    }

    // Recursive function to scan folders
    const scanFolderRecursively = (folder: FileSystemItem, currentPath: string): MisplacedFile[] => {
      const folderMisplaced: MisplacedFile[] = []

      // Check files in current folder
      if (folder.children) {
        folder.children.forEach(item => {
          if (item.type === "file") {
            const misplacedFile = checkFileLocation(item, folder.name)
            if (misplacedFile) {
              folderMisplaced.push(misplacedFile as MisplacedFile)
            }
          }
        })
      }

      // Recursively check subfolders
      if (folder.children) {
        folder.children.forEach(item => {
          if (item.type === "folder") {
            const subfolderMisplaced = scanFolderRecursively(item, `${currentPath}/${item.name}`)
            folderMisplaced.push(...subfolderMisplaced)
          }
        })
      }

      return folderMisplaced
    }

    // Start scanning from each top-level folder
    contents.forEach(folder => {
      if (folder.type === "folder") {
        const folderMisplaced = scanFolderRecursively(folder, folder.name)
        misplaced.push(...folderMisplaced)
      }
    })

    setMisplacedFiles(misplaced)
  }

  // Function to handle adding a new organization rule
  const handleAddRule = async () => {
    if (!selectedFolder || !newRule.folder_name || newRule.extensions.length === 0) {
      return
    }

    try {
      // Add the organization rule
      const result = await api.add_organization_rule(
        selectedFolder,
        newRule.folder_name,
        newRule.desired_folder_path,
        newRule.extensions,
      )

      if (result) {
        // Update organization rules
        const updatedRules = [...organizationRules, result];
        setOrganizationRules(updatedRules);
        
        // Reset the form and close dialog
        setNewRule({ folder_name: "", desired_folder_path: "", extensions: [] });
        setShowRuleDialog(false);
        
        // Re-check for misplaced files with all rules including the new one
        if (folderContents.length > 0) {
          findMisplacedFiles(folderContents, updatedRules);
        }
        
      } else {
        console.error("Failed to add organization rule.");
      }
    } catch (error) {
      console.error("Error adding organization rule:", error);
    }
  }

  // Function to toggle folder expansion
  const toggleFolderExpand = (folderId: string) => {
    setExpandedFolders((prev) => {
      if (prev.includes(folderId)) {
        return prev.filter((id) => id !== folderId)
      } else {
        return [...prev, folderId]
      }
    })
  }

  // Function to handle organizing files
  const handleOrganizeFiles = async () => {
    
    if (misplacedFiles.length === 0) {
      return
    }

    setIsOrganizing(true)
    setOrganizingProgress(0)

    try {
      const success = await api.organize_files(misplacedFiles);
      if (success) {
        // Don't scan folder immediately - we'll do it after the progress reaches 100%
        setMisplacedFiles([]);
      } else {
        console.error("Failed to organize files.")
      }
    } catch (error) {
      console.log(`There has been an error with organizing the file: ${error}`)
    }

    // Simulate organizing process
    const totalFiles = misplacedFiles.length
    let processed = 0

    const interval = setInterval(() => {
      processed++
      const progress = Math.round((processed / totalFiles) * 100)
      setOrganizingProgress(progress)

      if (processed >= totalFiles) {
        clearInterval(interval)
        setTimeout(() => {
          // After organizing, update the folder structure
          updateFolderStructure()
          setIsOrganizing(false)
          
          // Only re-scan the folder after the organizing process is complete
          if (selectedFolder) {
            scanFolder(selectedFolder);
          }
        }, 1000)
      }
    }, 500)
  }

  // Function to update folder structure after organizing
  const updateFolderStructure = () => {
    // This function would update the folder structure after organizing
    // In a real implementation, this would reflect the actual file system changes
    // made by your Python backend

    // For this mock, we'll just move the misplaced files to their correct folders
    const newContents = [...folderContents]

    misplacedFiles.forEach((file) => {
      // Remove file from current folder
      const currentFolderIndex = newContents.findIndex((f) => f.name === file.current_folder)
      if (currentFolderIndex !== -1) {
        newContents[currentFolderIndex].children = newContents[currentFolderIndex].children?.filter(
          (f) => f.id !== file.id,
        ) || []
      }

      // Add file to correct folder
      const correctFolderIndex = newContents.findIndex((f) => f.name === file.current_folder)
      if (correctFolderIndex !== -1) {
        if (!newContents[correctFolderIndex].children) {
          newContents[correctFolderIndex].children = []
        }
        newContents[correctFolderIndex].children?.push({
          ...file,
          id: `${file.id}-moved`,
        })
      }
    })

    setFolderContents(newContents)
  }

  // Function to toggle a rule's enabled state
  const toggleRuleEnabled = (ruleId: string) => {
    const updatedRules = organizationRules.map((rule) => {
      if (rule.id === ruleId) {
        return { ...rule, enabled: !rule.enabled }
      }
      return rule
    })

    setOrganizationRules(updatedRules)

    // Re-check for misplaced files with the updated rules
    if (folderContents.length > 0) {
      findMisplacedFiles(folderContents, updatedRules)
    }
  }

  // Function to delete a rule
  const deleteRule = (ruleId: string) => {
    const updatedRules = organizationRules.filter((rule) => rule.id !== ruleId)
    setOrganizationRules(updatedRules)

    // Re-check for misplaced files with the updated rules
    if (folderContents.length > 0) {
      findMisplacedFiles(folderContents, updatedRules)
    }
  }

  const handleEditRule = (ruleId: string) => {
    const ruleToEdit = organizationRules.find(rule => rule.id === ruleId);
    if (ruleToEdit) {
      setEditingRule(ruleToEdit);
      setNewRule({
        folder_name: ruleToEdit.folder_name,
        desired_folder_path: ruleToEdit.desired_folder_directory,
        extensions: ruleToEdit.extensions,
      })
    }
    setShowEditRuleDialog(true);
    setShowRuleDialog(true);
  }

  const handleUpdateRule = async () => {
    if (!editingRule || !selectedFolder || !newRule.folder_name || newRule.extensions.length === 0) {
      return;
    } 

    try {
      const result = await api.update_organization_rule(
        editingRule.id,
        selectedFolder,
        newRule.folder_name,
        newRule.desired_folder_path,
        newRule.extensions,
      );
    
      if (result) {
        
        const updatedRules = organizationRules.map(rule =>
          rule.id === editingRule.id ? result : rule
        );
        setOrganizationRules(updatedRules);

        setEditingRule(null);
        setNewRule({ folder_name: "", desired_folder_path: "", extensions: []});
        setShowEditRuleDialog(false);
        setShowRuleDialog(false);

        if (folderContents.length > 0) {
          findMisplacedFiles(folderContents, updatedRules)
        }

      } else {
        console.log("We couldn't update the rule. Please try again.")
        return;
      }

    } catch (error) {
      console.error("Error updating organizaiton rule: ", error);
    }
  }

  // Function to render the file tree
  const renderFileTree = (items: EnhancedFileSystemItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.id} className="file-tree-item">
        {item.type === "folder" ? (
          <div>
            <div
              className="flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
              style={{ paddingLeft: `${level * 16 + 8}px` }}
              onClick={() => toggleFolderExpand(item.id)}
            >
              {expandedFolders.includes(item.id) ? (
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
              )}
              <FolderOpen className="h-5 w-5 text-amber-500 mr-2" />
              <span className="text-sm font-medium dark:text-white">{item.name}</span>
              <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                {item.children && item.children.length ? `${item.children.length} ${item.children.length === 1 ? "item" : "items"}` : "0 items"}
              </span>
            </div>
            {expandedFolders.includes(item.id) && item.children && item.children.length > 0 && (
              <div className="folder-children">{renderFileTree(item.children, level + 1)}</div>
            )}
          </div>
        ) : (
          <div
            className={`flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer ${
              misplacedFiles.some((f) => f.id === item.id) ? "bg-red-50 dark:bg-red-900/20" : ""
            }`}
            style={{ paddingLeft: `${level * 16 + 28}px` }}
          >
            {item.icon ? item.icon : <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
            <span className="ml-2 text-sm dark:text-white">{item.name}</span>
            <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">{item.size}</span>
          </div>
        )}
      </div>
    ))
  }

  // Effect to expand all folders initially when folder contents change
  useEffect(() => {
    if (folderContents.length > 0) {
      setExpandedFolders(folderContents.map((folder) => folder.id))
    }
  }, [folderContents])

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight dark:text-white">File Organizer</h2>
          <p className="text-muted-foreground dark:text-gray-400">Organize your files by type and category</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleSelectFolder} className="dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700">
            <FolderOpen className="mr-2 h-4 w-4" />
            Select Folder
          </Button>
          <Button
            onClick={handleOrganizeFiles}
            disabled={!selectedFolder || misplacedFiles.length === 0 || isOrganizing}
            className="dark:bg-white dark:text-black"
          >
            {isOrganizing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Organizing...
              </>
            ) : (
              "Organize Files"
            )}
          </Button>
        </div>
      </div>

      {!selectedFolder ? (
        <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 border-gray-300 dark:border-gray-700">
          <FolderOpen className="mb-4 h-10 w-10 text-gray-400 dark:text-gray-600" />
          <p className="mb-2 text-center text-lg font-medium dark:text-white">Select a folder to organize</p>
          <p className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">Choose a folder to scan and organize its contents</p>
          <Button onClick={handleSelectFolder} className="dark:bg-white dark:text-black">Select Folder</Button>
        </div>
      ) : isScanning ? (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-8">
              <RefreshCw className="mb-4 h-10 w-10 text-gray-400 dark:text-gray-600 animate-spin" />
              <p className="mb-2 text-center text-lg font-medium dark:text-white">Scanning folder...</p>
              <p className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">This may take a moment</p>
            </div>
          </CardContent>
        </Card>
      ) : folderContents.length === 0 ? (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="mb-4 h-10 w-10 text-gray-400 dark:text-gray-600" />
              <p className="mb-2 text-center text-lg font-medium dark:text-white">No files found</p>
              <p className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">Please select a different folder to scan!</p>
              <Button onClick={handleSelectFolder}>Select Different Folder</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
      <Tabs defaultValue="file-explorer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 dark:bg-gray-800">
          <TabsTrigger value="file-explorer" className="dark:data-[state=active]:bg-gray-700 dark:text-gray-300 dark:data-[state=active]:text-white">File Explorer</TabsTrigger>
          <TabsTrigger value="rules" className="dark:data-[state=active]:bg-gray-700 dark:text-gray-300 dark:data-[state=active]:text-white">Organization Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="file-explorer">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="dark:border-gray-700">
              <div className="flex items-center justify-between">
                  <CardTitle className="dark:text-white">Folder Contents</CardTitle>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => scanFolder(selectedFolder)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
                <CardDescription className="dark:text-gray-400">
                  {selectedFolder ? normalizePath(selectedFolder) : ""}
                  {misplacedFiles.length > 0 && (
                    <Badge variant="outline" className="ml-2 bg-red-50 text-red-600 border border-gray-200/50 dark:bg-red-900/20 dark:text-red-400">
                      {misplacedFiles.length} misplaced files
                    </Badge>
                  )}
                </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-gray-300 dark:border-gray-700">
                  <div className="p-3 max-h-[400px] overflow-y-auto dark:text-white">{renderFileTree(folderContents)}</div>
                </div>

                {misplacedFiles.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3 dark:text-white">Misplaced Files</h3>
                    <div className="rounded-lg border border-gray-300 dark:border-gray-700">
                      <div className="flex items-center justify-between border-b border-gray-300 p-3 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                        <span className="font-medium dark:text-white">File Name</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Current Location</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Should Be In</span>
              </div>
              </div>
                      <div className="max-h-[200px] overflow-y-auto">
                        {misplacedFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between border-b border-gray-300 p-3 bg-red-50 dark:bg-red-900/20 dark:border-gray-700">
                            <div className="flex items-center space-x-2">
                              {file.icon}
                              <span className="text-sm dark:text-white">{file.name}</span>
              </div>
                    <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-500 w-32 text-right dark:text-gray-400">{file.current_folder}</span>
                              <span className="text-sm font-medium w-32 text-right dark:text-white">{file.correct_folder}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {isOrganizing && (
                      <div className="mt-4 flex items-center space-x-4">
                        <span className="text-sm dark:text-white">{organizingProgress}% complete</span>
                        <Progress value={organizingProgress} className="flex-1 h-2" />
                      </div>
                    )}

                    <div className="mt-4 flex justify-end">
                      <Button onClick={handleOrganizeFiles} disabled={isOrganizing}>
                        {isOrganizing ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Organizing...
                          </>
                        ) : (
                          "Organize Files"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                </CardContent>
              </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="dark:border-gray-700">
                <div className="flex items-center justify-between">
              <CardTitle className="dark:text-white">Organization Rules</CardTitle>
                  <Button onClick={() => setShowRuleDialog(true)} className="dark:bg-white dark:text-black">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Rule
                  </Button>
                </div>
                <CardDescription className="dark:text-gray-400">Define which file types belong in which folders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                  {organizationRules.map((rule) => (
                    <div key={rule.id} className="rounded-lg border border-gray-300 p-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                          <FolderOpen className="h-5 w-5 text-amber-500" />
                          <h3 className="font-medium dark:text-white">{rule.folder_name}</h3>
                          <h4 className="text-gray-500 text-sm mt-0. dark:text-gray-400">{normalizePath(rule.full_path)}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className={rule.enabled ? "bg-green-50 text-green-600 border border-gray-200/50 dark:bg-green-900/20 dark:text-green-400" : "bg-red-50 text-red-600 border border-gray-200/50 dark:bg-red-900/20 dark:text-red-400"}
                          >
                            {rule.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 dark:text-gray-400 dark:hover:bg-gray-700">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                              <DropdownMenuItem onClick={() => handleEditRule(rule.id)} className="dark:text-white dark:focus:bg-gray-700">
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleRuleEnabled(rule.id)} className="dark:text-white dark:focus:bg-gray-700">
                                {rule.enabled ? <><Circle className="mr-2 h-4 w-4" />Disable</> : <><CircleX className="mr-2 h-4 w-4" />Enable</>}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deleteRule(rule.id)} className="dark:text-white dark:focus:bg-gray-700">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                    </div>
                  </div>
                  <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {rule.extensions.map((ext, index) => (
                            <Badge key={index} variant="secondary" className="dark:bg-gray-700 dark:text-gray-200">
                              {ext}
                            </Badge>
                          ))}
                  </div>
                </div>
                    </div>
                  ))}

                  {organizationRules.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 border rounded-lg border-dashed dark:border-gray-700">
                      <AlertCircle className="mb-4 h-10 w-10 text-gray-400 dark:text-gray-600" />
                      <p className="mb-2 text-center text-lg font-medium dark:text-white">No rules defined</p>
                      <p className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">Add rules to organize your files</p>
                      <Button className="dark:bg-white dark:text-black" onClick={() => setShowRuleDialog(true)}>Add Rule</Button>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}

      <Dialog open={showRuleDialog} onOpenChange={(open) => {
        setShowRuleDialog(open);
        if (!open) {
          setShowEditRuleDialog(false);
          setNewRule({ folder_name: "", desired_folder_path: "", extensions: [] })
        }
      }}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            {showEditRuleDialog == true ? (
              <DialogTitle className="dark:text-white">Edit Organization Rule</DialogTitle>
            ) : (
              <DialogTitle className="dark:text-white">Add Organization Rule</DialogTitle>
            )}
            <DialogDescription className="dark:text-gray-400">Define which file types belong in which folder</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-name" className="dark:text-gray-300">Folder Name</Label>
              <Input
                id="folder-name"
                placeholder="Enter folder name"
                value={newRule.folder_name}
                onChange={(e) => setNewRule({ ...newRule, folder_name: e.target.value })}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file-types" className="dark:text-gray-300">File Types</Label>
              <Select
                onValueChange={(value) => {
                  const fileType = fileTypes.find((type) => type.id.toString() === value)
                  if (fileType) {
                    setNewRule({
                      ...newRule,
                      extensions: fileType.extension,
                    })
                  }
                }}
              >
                <SelectTrigger id="file-types" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select file type category" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  {fileTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()} className="dark:text-white dark:focus:bg-gray-700">
                      <div className="flex items-center">
                        {type.icon}
                        <span className="ml-2">{type.category}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newRule.extensions.length > 0 && (
              <div className="grid gap-2">
                <Label className="dark:text-gray-300">Selected Extensions</Label>
                <div className="flex flex-wrap gap-2 p-2 rounded-md dark:bg-background dark:border-gray-600">
                  {newRule.extensions.map((ext, index) => (
                    <Badge key={index} variant="secondary" className="dark:bg-gray-600 dark:text-gray-200">
                      {ext}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRuleDialog(false)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600">
              Cancel
            </Button>
            {showEditRuleDialog == true ? (
              <Button className="dark:bg-white dark:text-black" onClick={handleUpdateRule} disabled={!newRule.folder_name || newRule.extensions.length === 0}>
                Edit Rule
              </Button>
            ) : (
              <Button className="dark:bg-white dark:text-black" onClick={handleAddRule} disabled={!newRule.folder_name || newRule.extensions.length === 0}>
                Add Rule
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

## File: frontend/src/components/Layout.tsx
```typescript
import { ReactNode } from 'react';
import { Theme } from '@radix-ui/themes';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <Theme>
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-foreground">Chronos</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </Theme>
  );
}
```

## File: frontend/src/components/Sidebar.tsx
```typescript
import { Home, CheckSquare, FolderClosed } from "lucide-react"
import { ReactNode } from 'react';
import { Button } from './ui/button';

export function Sidebar({ setActiveTab } : { setActiveTab: (tab: string) => void }) {
  return (
    <div className="hidden border-r border-r-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 lg:block lg:w-64 md:w-32 sm:w-16 transition-colors duration-200">
        <div className="flex h-full flex-col">
            <div className="border-b border-b-gray-300 dark:border-gray-800 px-6 py-4">
                <div className="flex items-center">
                    <img src="assets/chronos.png" alt="logo" className="h-12 w-auto mr-2 dark:invert" />
                    <h2 className="text-2xl font-bold dark:text-white">Chronos</h2>
                </div>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
                <Button onClick={() => setActiveTab("dashboard")} variant="ghost" className="w-full justify-start">
                    <SidebarItem icon={<Home size={20} />} label="Dashboard" />
                </Button>
                <Button onClick={() => setActiveTab("tasks")} variant="ghost" className="w-full justify-start">
                    <SidebarItem icon={<CheckSquare size={20} />} label="Task Manager" />
                </Button>
                <Button onClick={() => setActiveTab("files")} variant="ghost" className="w-full justify-start">
                    <SidebarItem icon={<FolderClosed size={20} />} label="File Organizer" />
                </Button>
            </nav>
            <div className="border-t border-t-gray-300 dark:border-gray-800 p-4">
                <div className="rounded-md bg-gray-100 dark:bg-gray-800 p-3">
                    <h3 className="font-medium dark:text-white">Quick Help</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Press F1 anytime to view keyboard shortcuts and help documentation.
                    </p>
                </div>
            </div>
        </div>
    </div>
  )
}

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
}

function SidebarItem({ icon, label }: SidebarItemProps) {
    return (
      <div
        className="flex items-center rounded-md  py-2 text-sm font-medium text-gray-700 dark:text-gray-300  dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
      >
        <span className="mr-3 text-gray-500 dark:text-gray-400">{icon}</span>
        {label}
      </div>
    )
  }
```

## File: frontend/src/components/TaskManager.tsx
```typescript
"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Badge } from "./ui/badge"
import { Checkbox } from "./ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { PlusCircle, Search, Filter, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { Textarea } from "./ui/textarea"
import { api, statusToCode, Task } from "../lib/api"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [newTaskDialogOpen, setNewTaskDialogOpen] = useState(false)
  const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: 1,
    status: 0 // Default to Pending
  })
  
  // Edit form state
  const [editFormData, setEditFormData] = useState({
    id: "",
    title: "",
    description: "",
    dueDate: "",
    priority: 1,
    status: 0
  })
  
  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks()
  }, [])
  
  // Function to fetch tasks from the Python backend
  const fetchTasks = async () => {
    try {
      setLoading(true)
      const data = await api.getAllTasks()
      setTasks(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching tasks:", err)
      setError("Failed to fetch tasks")
    } finally {
      setLoading(false)
    }
  }
  
  // Handle input changes for the form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === "priority" ? parseInt(value) : value
    }))
  }

  // Handle input changes for the edit form
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: name === "priority" ? parseInt(value) : value
    }))
  }
  
  // Handle form submission to create a new task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newTask = await api.addTask(
        formData.title,
        formData.description,
        formData.dueDate,
        formData.priority,
        formData.status
      )
      
      console.log("Task creation response:", newTask) // Debug log
      
      // Reset form and refresh tasks
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        priority: 1,
        status: 0
      })
      
      // Close dialog if open
      setNewTaskDialogOpen(false)
      
      fetchTasks()
    } catch (err) {
      console.error("Error creating task:", err)
      setError("Failed to create task")
    }
  }

  // Handle form submission to update an existing task
  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask) return
    
    try {
      await api.updateTask(
        editFormData.id,
        editFormData.title,
        editFormData.description,
        editFormData.dueDate,
        editFormData.priority,
        editFormData.status
      )
      
      // Reset form and refresh tasks
      setEditFormData({
        id: "",
        title: "",
        description: "",
        dueDate: "",
        priority: 1,
        status: 0
      })
      
      setEditingTask(null)
      setEditTaskDialogOpen(false)
      fetchTasks()
    } catch (err) {
      console.error("Error updating task:", err)
      setError("Failed to update task")
    }
  }

  // Handle form submission to update an existing task
  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setEditFormData({
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.due_date || "",
      priority: task.priority,
      status: statusToCode[task.status]
    })
    setEditTaskDialogOpen(true)
  }
  
  // Function to update task status
  const handleStatusChange = async (taskId: string, newStatus: number) => {
    try {
      await api.setTaskStatus(taskId, newStatus)
      fetchTasks()
    } catch (err) {
      console.error("Error updating task status:", err)
      setError("Failed to update task status")
    }
  }
  
  // Function to delete a task
  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId)
      fetchTasks()
    } catch (err) {
      console.error("Error deleting task:", err)
      setError("Failed to delete task")
    }
  }

  // Filter tasks based on search query
  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const pendingTasks = filteredTasks.filter((task) => task.status === "Pending")
  const inProgressTasks = filteredTasks.filter((task) => task.status === "In Progress")
  const completedTasks = filteredTasks.filter((task) => task.status === "Completed")

  return (
    <div className="h-full overflow-hidden">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
    <div>
          <h2 className="text-2xl font-bold tracking-tight dark:text-white">Task Manager</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Create, manage, and track your tasks
          </p>
        </div>
        <Dialog open={newTaskDialogOpen} onOpenChange={setNewTaskDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1 dark:bg-white dark:text-black">
              <PlusCircle className="h-4 w-4" />
              <span>New Task</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="dark:text-white">Create New Task</DialogTitle>
              <DialogDescription className="dark:text-gray-400">Add a new task to your list</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTask}>
              <div className="py-4 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="dark:text-gray-300">Task Title</Label>
                  <Input 
                    id="title" 
                    name="title"
                    placeholder="Enter task title" 
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description"
                    placeholder="Enter task description" 
                    value={formData.description}
                    onChange={handleInputChange}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <Label htmlFor="priority" className="dark:text-gray-300">Priority</Label>
                    <Select 
                      defaultValue="1"
                      value={formData.priority.toString()}
                      onValueChange={(value) => {
                        setFormData(prev => ({
                          ...prev,
                          priority: parseInt(value)
                        }))
                      }}
                    >
                      <SelectTrigger id="priority" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem value="3" className="dark:text-white dark:focus:bg-gray-700">High</SelectItem>
                        <SelectItem value="2" className="dark:text-white dark:focus:bg-gray-700">Medium</SelectItem>
                        <SelectItem value="1" className="dark:text-white dark:focus:bg-gray-700">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status" className="dark:text-gray-300">Status</Label>
                    <Select
                      defaultValue="0"
                      value={formData.status.toString()}
                      onValueChange={(value) => {
                        setFormData(prev => ({
                          ...prev,
                          status: parseInt(value)
                        }))
                      }}
                    >
                      <SelectTrigger id="status" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem value="0" className="dark:text-white dark:focus:bg-gray-700">Pending</SelectItem>
                        <SelectItem value="1" className="dark:text-white dark:focus:bg-gray-700">In Progress</SelectItem>
                        <SelectItem value="2" className="dark:text-white dark:focus:bg-gray-700">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dueDate" className="dark:text-gray-300">Due Date</Label>
                    <Input 
                      id="dueDate" 
                      name="dueDate"
                      type="date" 
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      required
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="flex justify-end">
                <Button type="submit" className="dark:bg-white dark:text-black">Create Task</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editTaskDialogOpen} onOpenChange={setEditTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Edit Task</DialogTitle>
            <DialogDescription className="dark:text-gray-400">Update task details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateTask}>
            <div className="py-4 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Task Title</Label>
                <Input 
                  id="edit-title" 
                  name="title"
                  placeholder="Enter task title" 
                  value={editFormData.title}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  name="description"
                  placeholder="Enter task description" 
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select 
                    value={editFormData.priority.toString()}
                    onValueChange={(value) => {
                      setEditFormData(prev => ({
                        ...prev,
                        priority: parseInt(value)
                      }))
                    }}
                  >
                    <SelectTrigger id="edit-priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">High</SelectItem>
                      <SelectItem value="2">Medium</SelectItem>
                      <SelectItem value="1">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editFormData.status.toString()}
                    onValueChange={(value) => {
                      setEditFormData(prev => ({
                        ...prev,
                        status: parseInt(value)
                      }))
                    }}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Pending</SelectItem>
                      <SelectItem value="1">In Progress</SelectItem>
                      <SelectItem value="2">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-dueDate">Due Date</Label>
                  <Input 
                    id="edit-dueDate" 
                    name="dueDate"
                    type="date" 
                    value={editFormData.dueDate}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-end">
              <Button type="submit">Update Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="h-[calc(100%-60px)] overflow-y-auto pb-4">
        {loading ? (
          <div className="flex justify-center p-8 dark:text-white">Loading tasks...</div>
        ) : error ? (
          <div className="flex justify-center p-8 text-red-500">
            {error}
          </div>
        ) : (
          <>
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-8 pb-3 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[180px] dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter" />
                  </div>
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="all" className="dark:text-white dark:focus:bg-gray-700">All Tasks</SelectItem>
                  <SelectItem value="high" className="dark:text-white dark:focus:bg-gray-700">High Priority</SelectItem>
                  <SelectItem value="medium" className="dark:text-white dark:focus:bg-gray-700">Medium Priority</SelectItem>
                  <SelectItem value="low" className="dark:text-white dark:focus:bg-gray-700">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 dark:bg-gray-800">
                <TabsTrigger value="all" className="dark:data-[state=active]:bg-gray-700 dark:text-gray-300 dark:data-[state=active]:text-white">
                  All ({filteredTasks.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="dark:data-[state=active]:bg-gray-700 dark:text-gray-300 dark:data-[state=active]:text-white">
                  Pending ({pendingTasks.length})
                </TabsTrigger>
                <TabsTrigger value="in-progress" className="dark:data-[state=active]:bg-gray-700 dark:text-gray-300 dark:data-[state=active]:text-white">
                  In Progress ({inProgressTasks.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="dark:data-[state=active]:bg-gray-700 dark:text-gray-300 dark:data-[state=active]:text-white">
                  Completed ({completedTasks.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <TaskList 
                  tasks={filteredTasks} 
                  onStatusChange={handleStatusChange} 
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                />
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                <TaskList 
                  tasks={pendingTasks} 
                  onStatusChange={handleStatusChange} 
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                />
              </TabsContent>

              <TabsContent value="in-progress" className="mt-4">
                <TaskList 
                  tasks={inProgressTasks} 
                  onStatusChange={handleStatusChange} 
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                />
              </TabsContent>

              <TabsContent value="completed" className="mt-4">
                <TaskList 
                  tasks={completedTasks} 
                  onStatusChange={handleStatusChange} 
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                />
              </TabsContent>
            </Tabs>

            <Card className="mt-6 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="dark:border-gray-700">
                <CardTitle className="dark:text-white">Create New Task</CardTitle>
                <CardDescription className="dark:text-gray-400">Add a new task to your list</CardDescription>
              </CardHeader>
              <form onSubmit={handleCreateTask}>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title" className="dark:text-gray-300">Task Title</Label>
                      <Input 
                        id="title" 
                        name="title"
                        placeholder="Enter task title" 
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                      <Textarea 
                        id="description" 
                        name="description"
                        placeholder="Enter task description" 
                        value={formData.description}
                        onChange={handleInputChange}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="grid gap-2">
                        <Label htmlFor="priority" className="dark:text-gray-300">Priority</Label>
                        <Select 
                          defaultValue="1"
                          value={formData.priority.toString()}
                          onValueChange={(value) => {
                            setFormData(prev => ({
                              ...prev,
                              priority: parseInt(value)
                            }))
                          }}
                        >
                          <SelectTrigger id="priority" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            <SelectItem value="3" className="dark:text-white dark:focus:bg-gray-700">High</SelectItem>
                            <SelectItem value="2" className="dark:text-white dark:focus:bg-gray-700">Medium</SelectItem>
                            <SelectItem value="1" className="dark:text-white dark:focus:bg-gray-700">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status" className="dark:text-gray-300">Status</Label>
                        <Select
                          defaultValue="0"
                          value={formData.status.toString()}
                          onValueChange={(value) => {
                            setFormData(prev => ({
                              ...prev,
                              status: parseInt(value)
                            }))
                          }}
                        >
                          <SelectTrigger id="status" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            <SelectItem value="0" className="dark:text-white dark:focus:bg-gray-700">Pending</SelectItem>
                            <SelectItem value="1" className="dark:text-white dark:focus:bg-gray-700">In Progress</SelectItem>
                            <SelectItem value="2" className="dark:text-white dark:focus:bg-gray-700">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="dueDate" className="dark:text-gray-300">Due Date</Label>
                        <Input 
                          id="dueDate" 
                          name="dueDate"
                          type="date" 
                          value={formData.dueDate}
                          onChange={handleInputChange}
                          required
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end dark:border-gray-700">
                  <Button type="submit" className="dark:bg-white dark:text-black">Create Task</Button>
                </CardFooter>
              </form>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

function TaskList({ 
  tasks, 
  onStatusChange, 
  onDelete,
  onEdit
}: { 
  tasks: Task[]; 
  onStatusChange: (taskId: string, status: number) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
}) {
  if (tasks.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed dark:border-gray-700">
        <div className="text-center">
          <h3 className="text-lg font-medium dark:text-white">No tasks found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create a new task or change your search criteria.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div
            className={`h-1 w-full ${
              task.priority === 3 ? "bg-red-500" : task.priority === 2 ? "bg-amber-500" : "bg-green-500"
            }`}
          />
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Checkbox 
                  id={`task-${task.id}`}
                  checked={task.status === "Completed"}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onStatusChange(task.id, 2); // 2 = Completed
                    } else {
                      onStatusChange(task.id, 0); // 0 = Pending
                    }
                  }}
                  className="dark:border-gray-600 data-[state=checked]:bg-black data-[state=checked]:text-white dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-black"
                />
                <div>
                  <h3 className="font-medium dark:text-white">{task.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge
                      className={
                        task.priority === 3
                          ? "bg-red-500 text-white hover:bg-red-600" 
                          : task.priority === 2
                            ? "bg-orange-500 text-white hover:bg-orange-600" 
                            : "bg-green-500 text-white hover:bg-green-600"
                      }
                    >
                      {task.priority === 3 ? "High" : task.priority === 2 ? "Medium" : "Low"}
                    </Badge>
                    <Badge
                      className={
                        task.status === "Completed"
                          ? "bg-black text-white hover:bg-black/90"
                          : task.status === "In Progress"
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "bg-gray-500 text-white hover:bg-gray-600"
                      }
                    >
                      {task.status === "Completed" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                      {task.status === "In Progress" && <Clock className="mr-1 h-3 w-3" />}
                      {task.status === "Pending" && <AlertCircle className="mr-1 h-3 w-3" />}
                      {task.status}
                    </Badge>
                    {task.due_date && <span className="text-xs text-gray-500 dark:text-gray-400">Due: {task.due_date}</span>}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Select
                  defaultValue={statusToCode[task.status].toString()}
                  onValueChange={(value) => {
                    onStatusChange(task.id, parseInt(value));
                  }}
                >
                  <SelectTrigger className="w-[140px] dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="Change Status" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    <SelectItem value="0" className="dark:text-white dark:focus:bg-gray-700">Pending</SelectItem>
                    <SelectItem value="1" className="dark:text-white dark:focus:bg-gray-700">In Progress</SelectItem>
                    <SelectItem value="2" className="dark:text-white dark:focus:bg-gray-700">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEdit(task)}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:border-gray-600 dark:hover:bg-red-900/20"
                  onClick={() => onDelete(task.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

## File: frontend/src/lib/api.ts
```typescript
export type Task = {
  id: string;  
  title: string;
  description: string;
  due_date?: string;
  priority: number;
  status: "Pending" | "In Progress" | "Completed";
  status_code: 0 | 1 | 2;
};

export type Activity = {
  id: string;
  type: string;
  title: string;
  timestamp: string; // When the activity occurred
  status: string;
  due_date?: string; // Optional due_date for task-related activities
}

export type DashboardStats2 = {
  tasks_completed: number,
  files_organized: number,
  pending_tasks: number,
}
export interface FileSystemItem {
  id: string;
  name: string;
  type: "file" | "folder";
  path?: string;
  size?: string ;
  extension: string;
  children?: FileSystemItem[];
}

export interface MisplacedFile extends FileSystemItem {
  current_folder: string;
  correct_folder: string;
  source_path: string;
  destination_path: string;
}

export interface OrganizationRule {
  id: string;
  base_folder_directory: string;
  desired_folder_directory: string;
  folder_name: string;
  full_path: string;
  extensions: string[];
  enabled: boolean;
}

export interface DashboardStats {
  tasks_completed: number,
  files_organized: number,
  pending_tasks: number,
}
 
const isPyWebViewAvailable = (): boolean => {
  return typeof window !== 'undefined' && 
          window.pywebview !== undefined && 
          window.pywebview.api !== undefined;
}
  
type PyWebViewApiArgs = string | number | boolean | null | undefined | Record<string, unknown> | string[] | MisplacedFile[];

const callPythonApi = async (method: string, ...args: PyWebViewApiArgs[]) => {
  if (!isPyWebViewAvailable()) {
    console.warn(`PyWebView API not available. Method ${method} called with:`, args);
    return null;
  } // not avaliable for web browser - run dev rver with backend

  try {
    return await window.pywebview.api[method](...args);
  } catch(error) {
    console.error(`Error calling Python API method ${method}:`, error);
    throw error;
  }
};

// API wrapper functions
export const api = {
  getAllTasks: async(): Promise<Task[]> => {
    return await callPythonApi('get_all_tasks') || [];
  },

  getDashboardStats: async(): Promise<DashboardStats> => {
    const result = await callPythonApi('get_dashboard_stats');
    // If result is an array, take the first item, otherwise use the result directly
    const stats = Array.isArray(result) ? result[0] : result;
    return stats || {
      tasks_completed: 0,
      files_organized: 0,
      pending_tasks: 0,
    };
  },

  addTask: async (
    title: string,
    description: string,
    dueDate: string,
    priority: number = 1,
    status: number = 0,
  ): Promise<Task | null> => {
    return await callPythonApi('add_task', title, description, dueDate, priority, status)
  },

  updateTask: async (
    taskId: string,
    title: string,
    description: string,
    dueDate: string,
    priority: number,
    status: number,
  ): Promise<Task | null> => {
    return await callPythonApi('update_task', taskId, title, description, dueDate, priority, status)
  },

  deleteTask: async (taskId: string): Promise<boolean> => {
    return await callPythonApi('delete_task', taskId) || false;
  },

  setTaskStatus: async (taskId: string, status: number): Promise<boolean> => {
    return await callPythonApi('set_task_status', taskId, status) || false;
  },

  completeTask: async (taskId: string): Promise<boolean> => {
    return await callPythonApi('complete_task', taskId) || false;
  },

  select_folder: async(): Promise<string | null> => {
    return await callPythonApi('select_folder') || false;
  },

  scan_folder: async(folderPath: string): Promise<FileSystemItem[]> => {
    return await callPythonApi('scan_folder', folderPath) || false;
  },

  add_organization_rule: async(
    base_folder_directory: string,
    folder_name: string,
    desired_folder_directory: string,
    extensions: string[]
  ): Promise<OrganizationRule> => {
    return await callPythonApi('add_organization_rule', base_folder_directory, folder_name, desired_folder_directory, extensions);
  },
  
  organize_files: async(
    misplaced_files: MisplacedFile[],
  ): Promise<boolean> => {
    return await callPythonApi('organize_files', misplaced_files) || false;
  },

  update_organization_rule: async(
    ruleId: string,
    base_folder_directory: string,
    folder_name: string,
    desired_folder_directory: string,
    extensions: string[]
  ): Promise<OrganizationRule> => {
    return await callPythonApi(
      'update_organization_rule',
      ruleId,
      base_folder_directory,
      folder_name,
      desired_folder_directory,
      extensions
    );
  },

  get_recent_activities: async(): Promise<Activity[]> => {
    return await callPythonApi('get_recent_activities') || [];
  },

  get_latest_tasks: async(): Promise<Activity[]> => {
    return await callPythonApi('get_latest_tasks') || [];
  }
  
};

// Map status string to status code for API calls
export const statusToCode: Record<string, number> = {
  "Pending": 0,
  "In Progress": 1,
  "Completed": 2
};

// Map status code to status string for display
export const codeToStatus: Record<number, string> = {
  0: "Pending",
  1: "In Progress",
  2: "Completed"
};
```

## File: frontend/src/lib/utils.ts
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## File: frontend/src/types/task.ts
```typescript
export interface Task {
  id?: number;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  priority?: number;
}

export interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}
```

## File: frontend/src/App.css
```css
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}
```

## File: frontend/src/App.tsx
```typescript
import Dashboard from "./components/Dashboard";
import { Sidebar } from "./components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskManager from "./components/TaskManager";
import Files from "./components/Files";
import { useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import { Moon, Sun } from "lucide-react";


export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
      document.documentElement.classList.remove("light")
    } else {
      document.documentElement.classList.remove("dark")
      document.documentElement.classList.add("light")
    }
  }, [darkMode])
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-normal dark:text-white">Task & Folder Manager</h1>
            <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)} className="rounded-full">
              {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 dark:bg-gray-800">
              <TabsTrigger 
                value="dashboard"
                className="dark:data-[state=active]:bg-gray-700 dark:text-gray-300 dark:data-[state=active]:text-white"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="tasks"
                className="dark:data-[state=active]:bg-gray-700 dark:text-gray-300 dark:data-[state=active]:text-white"
              >
                Tasks
              </TabsTrigger>
              <TabsTrigger 
                value="files"
                className="dark:data-[state=active]:bg-gray-700 dark:text-gray-300 dark:data-[state=active]:text-white"
              >
                Files
              </TabsTrigger>

            </TabsList>

            <TabsContent value="dashboard">
              <Dashboard setActiveTab={setActiveTab} />
            </TabsContent>

            <TabsContent value="tasks">
              <TaskManager />
            </TabsContent>

            <TabsContent value="files">
              <Files />
            </TabsContent>

          </Tabs>
        </div>
      </main>
    </div>
  );
}
```

## File: frontend/src/index.css
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');

@plugin 'tailwindcss-animate';

@custom-variant dark (&:is(.dark *));

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-[hsl(var(--border))];
  }
  body {
    @apply bg-background text-foreground font-sans;
  }
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## File: frontend/src/main.tsx
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import '@radix-ui/themes/styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

## File: frontend/src/vite-env.d.ts
```typescript
interface Window {
    pywebview: {
      api: {
        [key: string]: (...args: any[]) => Promise<any>;
        get_all_tasks: () => Promise<import('./lib/api').Task[]>;
        add_task: (title: string, description: string, due_date?: string, priority?: number, status?: number) => Promise<import('./lib/api').Task>;
        update_task: (task_id: string, title: string, description: string, due_date?: string, priority?: number, status?: number) => Promise<import('./lib/api').Task | null>;
        delete_task: (task_id: string) => Promise<boolean>;
        set_task_status: (task_id: string, status: number) => Promise<boolean>;
        complete_task: (task_id: string) => Promise<boolean>;
        select_folder: () => Promise<string | null>;
        scan_folder: (folderPath: string) => Promise<import('./lib/api').FileSystemItem[]>;
        add_organization_rule: (
          base_folder_directory: string,
          folder_name: string,
          desired_folder_directory: string,
          extensions: string[]
        ) => Promise<{
          id: string;
          base_folder_directory: string;
          desired_folder_directory: string;
          folder_name: string;
          extensions: string[]
          full_path: string;
          enabled: boolean;
        }>;
        get_organization_rules: (base_folder?: string) => Promise<Array<{
          id: string;
          base_folder: string;
          folder_name: string;
          full_path: string;
          extensions: string[];
          enabled: boolean;
        }>>;
        get_dashboard_stats: () => Promise<import('./lib/api').DashboardStats[]>;
        delete_organization_rule: (rule_id: string, base_folder?: string) => Promise<boolean>;
        clear_organization_rules: (base_folder?: string) => Promise<boolean>;
        organize_files: (misplaced_files: Array<{
          id: string;
          name: string;
          type: string;
          path: string;
          current_folder: string;
          correct_folder: string;
          source_path: string;
          destination_path: string;
        }>) => Promise<boolean>;
    };
        update_organization_rule: (
          rule_id: string,
          base_folder_directory: string,
          folder_name: string,
          desired_folder_directory: string,
          extensions: string[]
        ) => Promise<{
          id: string;
          base_folder_directory: string;
          desired_folder_directory: string;
          folder_name: string;
          extensions: string[],
          full_path: string;
          enabled: boolean;
        }>
        get_recent_activities: () => Promise<import('./lib/api').Activity[]>;
        get_latest_tasks: () => Promise<import('./lib/api').Activity[]>;
 };
}

/// <reference types="vite/client" />
```

## File: frontend/.gitignore
```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

## File: frontend/components.json
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

## File: frontend/eslint.config.js
```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
```

## File: frontend/index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Chronos</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## File: frontend/package.json
```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/themes": "^3.2.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.482.0",
    "react": "^19.0.0",
    "react-day-picker": "^9.6.2",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.3.0",
    "tailwind-merge": "^3.0.2"
  },
  "devDependencies": {
    "@eslint/js": "^9.21.0",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.21.0",
    "eslint-plugin-react-hooks": "^5.1.0",
    "eslint-plugin-react-refresh": "^0.4.19",
    "globals": "^15.15.0",
    "postcss": "^8.5.3",
    "tailwindcss": "^3.4.17",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "~5.7.2",
    "typescript-eslint": "^8.24.1",
    "vite": "^6.2.0"
  }
}
```

## File: frontend/postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## File: frontend/tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

## File: frontend/tsconfig.app.json
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

## File: frontend/tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## File: frontend/tsconfig.node.json
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

## File: frontend/vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

## File: .gitignore
```
# ignore TODO.md
DEVELOPMENT.md
PROGRAM.md
CODEBASE.md
CHANGES.md
MERMAID.md

# code
dev.py
dev.ts

# Frontend
frontend/node_modules/
frontend/.pnp
frontend/.pnp.js
frontend/coverage/
frontend/build/
frontend/dist/
frontend/.next/
frontend/out/
frontend/.env.local
frontend/.env.development.local
frontend/.env.test.local
frontend/.env.production.local
frontend/npm-debug.log*
frontend/yarn-debug.log*
frontend/yarn-error.log*

# Backend
backend/__pycache__/
backend/*.pyc
backend/*.pyo
backend/*.pyd
backend/.Python
backend/venv/
backend/env/
backend/.env
backend/.venv
backend/data/*.db
backend/data/*.json
backend/dist/
backend/build/
backend/*.spec

# IDE
.vscode/
.idea/
*.swp
*.swo
```

## File: README.md
```markdown
# Chronos

A simple, user-friendly application for managing tasks, automating file organization, and scheduling tasks.

## Features

- **Task Management**: Create, view, and complete tasks
- **File Organization**: Automatically organize files by extension
- **Folder Watching**: Set up rules to automatically organize files when they change
- **Task Scheduling**: Schedule tasks to be completed at specific times
- **Data Storage**: Save tasks to JSON files or a SQLite database

## Technology Stack

- **Frontend**:
  - React with TypeScript
  - Vite for development and building
  - Tailwind CSS for styling
  - Radix UI for components

- **Backend**:
  - Python 3.6+
  - PyWebView 
  - SQLite
```
