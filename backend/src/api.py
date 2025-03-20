from task_manager import TaskManager, Task
from storage import Storage
from datetime import datetime

class TaskAPI:
    def __init__(self):
        self.task_manager = TaskManager()
        self.storage = Storage("tasks.db")  # SQLite database connection
        
        # Load tasks from database on startup
        self.load_tasks_from_db()
    
    def get_all_tasks(self):
        # Return all tasks as a serializable format (list of dictionaries)
        tasks = []
        for i, task in enumerate(self.task_manager.list_tasks()):
            task_dict = task.dict()
            # Add the index as id and convert status flags to a single status string
            task_dict["id"] = i
            if task.completed:
                task_dict["status"] = "Completed"
            elif task.inProgress:
                task_dict["status"] = "In Progress"
            else:
                task_dict["status"] = "Pending"
            tasks.append(task_dict)
        return tasks
    
    def add_task(self, title, description, due_date=None, priority=1, status=0):
        # Create a new Task object with status based on integer code
        # 0: Pending, 1: In Progress, 2: Completed
        new_task = Task(
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
        
        # Convert status code to string for frontend
        status_strings = {0: "Pending", 1: "In Progress", 2: "Completed"}
        task_dict["status"] = status_strings.get(status, "Pending")
        return task_dict

    def complete_task(self, task_index):
        # Mark a task as completed
        if 0 <= task_index < len(self.task_manager.tasks):
            task = self.task_manager.tasks[task_index]
            task.completed = True
            task.inProgress = False
            task.pending = False
            
            # Update in database
            self.update_task_in_db(task)
            
            return True
        return False
    
    def set_task_status(self, task_index, status):
        # Set the task status based on integer code
        # 0: Pending, 1: In Progress, 2: Completed
        if 0 <= task_index < len(self.task_manager.tasks):
            task = self.task_manager.tasks[task_index]
            
            # Update status flags
            task.pending = (status == 0)
            task.inProgress = (status == 1)
            task.completed = (status == 2)
            
            # Update in database
            self.update_task_in_db(task)
            
            return True
        return False
    
    def update_task(self, task_id, title, description, due_date=None, priority=1, status=0):
        # Find the task with the given id
        for i, task in enumerate(self.task_manager.tasks):
            if i == task_id:  # Using index as ID for simplicity
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
                
                # Update in database
                self.update_task_in_db(task)
                
                # Return updated task with status string
                task_dict = task.dict()
                # Convert status code back to string for frontend
                status_strings = {0: "Pending", 1: "In Progress", 2: "Completed"}
                task_dict["status"] = status_strings.get(status, "Pending")
                task_dict["id"] = i
                return task_dict
        return None
    
    def delete_task(self, task_index):
        # Remove a task
        if 0 <= task_index < len(self.task_manager.tasks):
            task = self.task_manager.tasks[task_index]
            self.task_manager.remove_task(task)
            
            # Delete from database
            self.delete_task_from_db(task)
            
            return True
        return False
    
    # Database operations
    def save_task_to_db(self, task):
        with self.storage.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO tasks (title, description, due_date, completed, in_progress, pending, priority) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (task.title, task.description, task.due_date.isoformat() if task.due_date else None, 
                 1 if task.completed else 0, 1 if task.inProgress else 0, 1 if task.pending else 0, task.priority)
            )
            conn.commit()
    
    def update_task_in_db(self, task):
        with self.storage.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE tasks SET title = ?, description = ?, due_date = ?, completed = ?, in_progress = ?, pending = ?, priority = ? WHERE title = ? AND description = ?",
                (task.title, task.description, task.due_date.isoformat() if task.due_date else None, 
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
            # Add new columns to the query
            cursor.execute("SELECT title, description, due_date, completed, in_progress, pending, priority FROM tasks")
            tasks_data = cursor.fetchall()
            
            # Clear current tasks
            self.task_manager = TaskManager()
            
            # Add each loaded task to the task manager
            for title, description, due_date, completed, in_progress, pending, priority in tasks_data:
                self.task_manager.add_task(Task(
                    title=title,
                    description=description,
                    due_date=datetime.fromisoformat(due_date) if due_date else None,
                    completed=bool(completed),
                    in_progress=bool(in_progress),
                    pending=bool(pending),
                    priority=priority
                ))