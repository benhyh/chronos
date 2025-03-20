# Import datetime module for handling dates and times
from datetime import datetime

# Import typing module for type hints
# List: for creating lists with specific types
# Optional: for fields that can be None
from typing import List, Optional

# Import BaseModel from pydantic for data validation
from pydantic import BaseModel

# Define a Task class that inherits from BaseModel
# This provides automatic validation and serialization
class Task(BaseModel):
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
