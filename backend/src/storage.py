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