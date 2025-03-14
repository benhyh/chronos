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
    
    

    