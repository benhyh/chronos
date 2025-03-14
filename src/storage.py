# Import sqlite3 - it's like bringing a special toolbox that helps us store information in a mini-database
import sqlite3
# Import contextmanager - it's like a helper that makes sure we clean up after ourselves when using resources
from contextlib import contextmanager

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

    # This method creates the structure of our filing cabinet if it doesn't exist yet
    def init_db(self):
        # Open a connection to our filing cabinet (like unlocking it with a key)
        with self.get_connection() as conn:
            # Execute a command to create a table - this is like adding a drawer labeled "tasks"
            conn.execute('''
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY,  -- This is like giving each task a unique number tag
                    title TEXT NOT NULL,     -- This is the name of the task (and it can't be empty)
                    description TEXT,        -- This is extra information about the task
                    due_date TEXT,           -- This is when the task needs to be done by
                    completed BOOLEAN DEFAULT 0  -- This tracks if the task is done (0=not done, like a checkbox)    
                )
            ''')