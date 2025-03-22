import uuid
import json
from task_manager import TaskManager, Task
from storage import Storage
from datetime import datetime

class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.strftime('%Y-%m-%d')  # Only return YYYY-MM-DD
        return super().default(obj)

class TaskAPI:
    def __init__(self):
        self.task_manager = TaskManager()
        self.storage = Storage("tasks.db")  # SQLite database connection
        
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
    
    def add_task(self, title, description, due_date=None, priority=1, status=0):
        # Create a new Task object with status based on integer code
        # 0: Pending, 1: In Progress, 2: Completed
        new_task = Task(
            id= str(uuid.uuid4()),
            title=title,
            description=description, 
            due_date=datetime.fromisoformat(due_date) if due_date else None,
            priority=priority,
            pending=(status == 0),
            inProgress=(status == 1),
            completed=(status == 2)
        )
        
        # Add it to the task manager
        self.task_manager.add_task(new_task)

        # Save to database
        self.save_task_to_db(new_task)
    
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
                
                # Update in database
                self.update_task_in_db_by_id(task)
                
                return True
        return False
    
    def update_task(self, task_id, title, description, due_date=None, priority=1, status=0):
        # Find the task with the given UUID
        for task in self.task_manager.list_tasks():
            if task.id == task_id:  # Using UUID instead of index
                # Update task attributes
                task.title = title if title != "" else task.title
                task.description = description if description != "" else task.description 
                task.due_date = datetime.fromisoformat(due_date) if due_date else None
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

    def select_folder(self):
        """Opens a folder selection dialog and returns the selected path"""
        import tkinter as tk
        from tkinter import filedialog
        
        print("select_folder called from frontend")
        
        try:
            root = tk.Tk()
            root.withdraw()
            folder_path = filedialog.askdirectory()
            root.destroy()
            
            print(f"Selected folder: {folder_path}")
            return folder_path if folder_path else None
        except Exception as e:
            print(f"Error in select_folder: {e}")
            return None