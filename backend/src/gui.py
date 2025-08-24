import tkinter as tk
from tkinter import ttk
from tkinter import filedialog, messagebox
import re
import threading
import os.path

from task_manager import TaskManager, Task
from file_ops import FileManager
from automation import AutomationRule, FolderWatcher
from data_processor import DataProcessor
from scheduler import TaskScheduler
from storage import Storage
from watchdog.observers import Observer
from customtkinter import *

class AutomationGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Task Automation Suite")
        
        self.task_manager = TaskManager()
        self.file_manager = None
        self.task_scheduler = TaskScheduler()
        self.storage = Storage("tasks.db")
        
        self.setup_ui()
        
    def setup_ui(self):
        self.tab_control = ttk.Notebook(self.root)
        
        self.task_tab = ttk.Frame(self.tab_control)
        
        self.file_tab = ttk.Frame(self.tab_control)
        
        self.schedule_tab = ttk.Frame(self.tab_control)
        
        self.tab_control.add(self.task_tab, text="Tasks")
        self.tab_control.add(self.file_tab, text="File Management")
        self.tab_control.add(self.schedule_tab, text="Scheduling")
        
        self.tab_control.pack(expand=1, fill="both")
        
        self.setup_task_tab()
        self.setup_file_tab()
        self.setup_schedule_tab()
    
    def setup_task_tab(self):
        task_frame = ttk.LabelFrame(self.task_tab, text="Task Management")
        task_frame.pack(fill="both", expand=1, padx=10, pady=10)
        
        ttk.Label(task_frame, text="Task Title:").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        self.task_title_entry = ttk.Entry(task_frame, width=30)
        self.task_title_entry.grid(row=0, column=1, padx=5, pady=5)
        
        ttk.Label(task_frame, text="Description:").grid(row=1, column=0, padx=5, pady=5, sticky="w")
        self.task_desc_entry = ttk.Entry(task_frame, width=30)
        self.task_desc_entry.grid(row=1, column=1, padx=5, pady=5)
        
        add_task_btn = ttk.Button(task_frame, text="Add Task", command=self.add_task)
        add_task_btn.grid(row=2, column=0, padx=5, pady=5)

        delete_task_btn = ttk.Button(task_frame, text="Delete Task", command=self.delete_task)
        delete_task_btn.grid(row=2, column=2, padx=5, pady=5)
        
        complete_task_btn = ttk.Button(task_frame, text="Complete Task", command=self.complete_task)
        complete_task_btn.grid(row=2, column=1, padx=5, pady=5)
        
        ttk.Label(task_frame, text="Task List:").grid(row=3, column=0, padx=5, pady=5, sticky="w")
        self.task_listbox = tk.Listbox(task_frame, width=50, height=10)
        self.task_listbox.grid(row=4, column=0, columnspan=2, padx=5, pady=5)
        
        save_tasks_btn = ttk.Button(task_frame, text="Save Tasks to JSON", command=self.save_tasks)
        save_tasks_btn.grid(row=5, column=0, padx=5, pady=5)
        
        load_tasks_btn = ttk.Button(task_frame, text="Load Tasks from JSON", command=self.load_tasks)
        load_tasks_btn.grid(row=5, column=1, padx=5, pady=5)
        
        save_to_db_btn = ttk.Button(task_frame, text="Save to Database", command=self.save_tasks_to_db)
        save_to_db_btn.grid(row=6, column=0, padx=5, pady=5)
        
        load_from_db_btn = ttk.Button(task_frame, text="Load from Database", command=self.load_tasks_from_db)
        load_from_db_btn.grid(row=6, column=1, padx=5, pady=5)
        
        self.load_tasks_from_db()
    
    def setup_file_tab(self):
        file_frame = ttk.LabelFrame(self.file_tab, text="File Organization")
        file_frame.pack(fill="both", expand=1, padx=10, pady=10)
        
        select_folder_btn = ttk.Button(file_frame, text="Select Folder to Watch", command=self.select_folder)
        select_folder_btn.grid(row=0, column=0, padx=5, pady=5)
        
        self.folder_label = ttk.Label(file_frame, text="No folder selected")
        self.folder_label.grid(row=0, column=1, padx=5, pady=5)
        
        organize_btn = ttk.Button(file_frame, text="Organize Files by Extension", command=self.organize_files)
        organize_btn.grid(row=1, column=0, columnspan=2, padx=5, pady=5)
        
        automation_frame = ttk.LabelFrame(self.file_tab, text="Folder Automation")
        automation_frame.pack(fill="both", expand=1, padx=10, pady=10)
        
        ttk.Label(automation_frame, text="File Pattern:").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        self.pattern_entry = ttk.Entry(automation_frame, width=30)
        self.pattern_entry.grid(row=0, column=1, padx=5, pady=5)
        self.pattern_entry.insert(0, "*.txt")
        
        start_watching_btn = ttk.Button(automation_frame, text="Start Watching Folder", command=self.start_folder_watcher)
        start_watching_btn.grid(row=1, column=0, columnspan=2, padx=5, pady=5)
        
        self.automation_status = ttk.Label(automation_frame, text="Automation not active")
        self.automation_status.grid(row=2, column=0, columnspan=2, padx=5, pady=5)
    
    def setup_schedule_tab(self):
        schedule_frame = ttk.LabelFrame(self.schedule_tab, text="Task Scheduling")
        schedule_frame.pack(fill="both", expand=1, padx=10, pady=10)
        
        ttk.Label(schedule_frame, text="Select Task:").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        self.task_dropdown_var = tk.StringVar()
        self.task_dropdown = ttk.Combobox(schedule_frame, textvariable=self.task_dropdown_var, state="readonly")
        self.task_dropdown.grid(row=0, column=1, padx=5, pady=5)
        
        ttk.Label(schedule_frame, text="Time (HH:MM):").grid(row=1, column=0, padx=5, pady=5, sticky="w")
        self.time_entry = ttk.Entry(schedule_frame, width=10)
        self.time_entry.grid(row=1, column=1, padx=5, pady=5, sticky="w")
        self.time_entry.insert(0, "08:00")
        
        schedule_btn = ttk.Button(schedule_frame, text="Schedule Task", command=self.schedule_task)
        schedule_btn.grid(row=2, column=0, columnspan=2, padx=5, pady=5)
        
        ttk.Label(schedule_frame, text="Scheduled Tasks:").grid(row=3, column=0, padx=5, pady=5, sticky="w")
        self.schedule_listbox = tk.Listbox(schedule_frame, width=50, height=10)
        self.schedule_listbox.grid(row=4, column=0, columnspan=2, padx=5, pady=5)
        
        start_scheduler_btn = ttk.Button(schedule_frame, text="Start Scheduler", command=self.start_scheduler)
        start_scheduler_btn.grid(row=5, column=0, columnspan=2, padx=5, pady=5)
        
        self.scheduler_status = ttk.Label(schedule_frame, text="Scheduler not running")
        self.scheduler_status.grid(row=6, column=0, columnspan=2, padx=5, pady=5)
        
        self.tab_control.bind("<<NotebookTabChanged>>", self.on_tab_changed)
    
    def on_tab_changed(self, event):
        if self.tab_control.index("current") == 2:
            self.update_task_dropdown()
            self.update_schedule_listbox()
    
    def update_task_dropdown(self):
        tasks = self.task_manager.list_tasks()
        
        task_titles = [task.title for task in tasks]
        
        self.task_dropdown['values'] = task_titles
        
        if task_titles:
            self.task_dropdown.current(0)
    
    def update_schedule_listbox(self):
        self.schedule_listbox.delete(0, tk.END)
        
        for task_name, time in self.task_scheduler.scheduled_tasks.items():
            self.schedule_listbox.insert(tk.END, f"{task_name} - {time}")
    
    def schedule_task(self):
        task_title = self.task_dropdown_var.get()
        
        if not task_title:
            messagebox.showerror("Error", "Please select a task to schedule!")
            return
        
        schedule_time = self.time_entry.get()
        
        if not re.match(r"^\d{2}:\d{2}$", schedule_time):
            messagebox.showerror("Error", "Please enter a valid time in HH:MM format!")
            return
        
        selected_task = None
        for task in self.task_manager.list_tasks():
            if task.title == task_title:
                selected_task = task
                break
        
        if not selected_task:
            messagebox.showerror("Error", "Task not found!")
            return
        
        def scheduled_action():
            selected_task.completed = True
            self.root.after(0, self.update_task_list)
            self.root.after(0, lambda: messagebox.showinfo("Scheduled Task", f"Task '{task_title}' has been completed!"))
        
        self.task_scheduler.add_scheduled_task(scheduled_action, schedule_time)
        
        self.update_schedule_listbox()
        
        messagebox.showinfo("Success", f"Task '{task_title}' scheduled for {schedule_time}!")
    
    def start_scheduler(self):
        if hasattr(self, 'scheduler_thread') and self.scheduler_thread.is_alive():
            messagebox.showinfo("Info", "Scheduler is already running!")
            return
        
        self.scheduler_thread = threading.Thread(target=self.task_scheduler.start_scheduler)
        self.scheduler_thread.daemon = True
        self.scheduler_thread.start()
        
        self.scheduler_status.config(text="Scheduler is running")
        
        messagebox.showinfo("Success", "Scheduler started successfully!")

    def add_task(self):
        title = self.task_title_entry.get()
        description = self.task_desc_entry.get()
        
        if not title:
            messagebox.showerror("Error", "Task title cannot be empty!")
            return
        
        new_task = Task(title=title, description=description)
        self.task_manager.add_task(new_task)
        
        self.update_task_list()
        
        self.task_title_entry.delete(0, tk.END)
        self.task_desc_entry.delete(0, tk.END)
    
    def delete_task(self):
    
        selected_index = self.task_listbox.curselection()

        if not selected_index:
            messagebox.showerror("Error", "Please select a task to delete!")
            return
        
        task = self.task_manager.list_tasks()[selected_index[0]]

        confirm = messagebox.askyesno("Confirm Delete", f"Are you sure you want to delete the task `{task.title}`?")
        if not confirm:
            return
        
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
      
    
    def update_task_list(self):
        self.task_listbox.delete(0, tk.END)
        
        for i, task in enumerate(self.task_manager.list_tasks()):
            status = "✓" if task.completed else "□"
            self.task_listbox.insert(tk.END, f"{status} {task.title} - {task.description}")
    
    def complete_task(self):
        selected_index = self.task_listbox.curselection()
        
        if not selected_index:
            messagebox.showerror("Error", "Please select a task to complete!")
            return
        
        self.task_manager.complete_tasks(selected_index[0])
        
        self.update_task_list()
        
    
    def save_tasks(self):
        DataProcessor.save_tasks_json(
            [task.dict() for task in self.task_manager.list_tasks()], 
            "tasks.json"
        )
        
        messagebox.showinfo("Success", "Tasks saved to tasks.json!")
    
    def load_tasks(self):
        tasks_data = DataProcessor.load_tasks_json("tasks.json")
        
        self.task_manager = TaskManager()
        
        for task_data in tasks_data:
            self.task_manager.add_task(Task(**task_data))
        
        self.update_task_list()
        
        messagebox.showinfo("Success", f"Loaded {len(tasks_data)} tasks from tasks.json!")
    
    def select_folder(self):
        folder_path = filedialog.askdirectory(title="Select Folder to Watch")
        
        if folder_path:
            self.file_manager = FileManager(folder_path)
            
            self.folder_label.config(text=folder_path)
            
            messagebox.showinfo("Success", f"Now watching folder: {folder_path}")
    
    def organize_files(self):
        if not self.file_manager:
            messagebox.showerror("Error", "Please select a folder first!")
            return
        
        self.file_manager.organize_by_extension()
        
        messagebox.showinfo("Success", "Files organized by extension!")
    
    def start_folder_watcher(self):
        if not self.file_manager:
            messagebox.showerror("Error", "Please select a folder first!")
            return
        
        pattern_text = self.pattern_entry.get()
        
        class PatternMatcher:
            def __init__(self, pattern):
                regex_pattern = pattern.replace(".", "\\.").replace("*", ".*") + "$"
                self.pattern = re.compile(regex_pattern)
            
            def match(self, path):
                return self.pattern.search(path) is not None
        
        pattern = PatternMatcher(pattern_text)
        
        def auto_organize_action(path):
            if os.path.isfile(path):
                self.file_manager.organize_by_extension()
                self.root.after(0, lambda: self.automation_status.config(
                    text=f"Organized files after change to: {os.path.basename(path)}"
                ))
        
        rule = AutomationRule(pattern, auto_organize_action)
        
        self.folder_watcher = FolderWatcher([rule])
        
        self.observer = Observer()
        self.observer.schedule(self.folder_watcher, str(self.file_manager.watch_folder), recursive=False)
        
        self.observer.start()
        
        self.automation_status.config(text=f"Watching folder for {pattern_text} files")
        
        messagebox.showinfo("Success", f"Now watching folder for {pattern_text} files!")
    
    def on_closing(self):
        if hasattr(self, 'observer') and self.observer.is_alive():
            self.observer.stop()
            self.observer.join()
        
        self.root.destroy()

    def save_tasks_to_db(self):
        with self.storage.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("DELETE FROM tasks")
            
            for task in self.task_manager.list_tasks():
                cursor.execute(
                    "INSERT INTO tasks (title, description, completed) VALUES (?, ?, ?)",
                    (task.title, task.description, 1 if task.completed else 0)
                )
            
            conn.commit()
        
        messagebox.showinfo("Success", "Tasks saved to database!")
    
    def load_tasks_from_db(self):
        with self.storage.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT title, description, completed FROM tasks")
            
            tasks_data = cursor.fetchall()
        
        self.task_manager = TaskManager()
        
        for title, description, completed in tasks_data:
            self.task_manager.add_task(Task(
                title=title,
                description=description,
                completed=bool(completed)
            ))
        
        self.update_task_list()
        
        if tasks_data:
            messagebox.showinfo("Success", f"Loaded {len(tasks_data)} tasks from database!")

if __name__ == "__main__":
    root = tk.Tk()
    root.geometry("600x400")
    app = AutomationGUI(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()