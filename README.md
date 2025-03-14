# Chronos

A simple, user-friendly application for managing tasks, automating file organization, and scheduling tasks.

## Features

- **Task Management**: Create, view, and complete tasks
- **File Organization**: Automatically organize files by extension
- **Folder Watching**: Set up rules to automatically organize files when they change
- **Task Scheduling**: Schedule tasks to be completed at specific times
- **Data Storage**: Save tasks to JSON files or a SQLite database

## How to Run

1. Make sure you have Python 3.6+ installed
2. Install the required packages:
   ```
   pip install tkinter watchdog schedule pydantic
   ```
3. Run the main.py file:
   ```
   python src/main.py
   ```