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