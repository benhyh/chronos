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
