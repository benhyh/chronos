# Import tools that help us watch folders for any changes (like a security camera for files)
from watchdog.observers import Observer  
# Import a special tool that helps us respond when files change
from watchdog.events import FileSystemEventHandler

# Create an AutomationRule class - think of it as a set of instructions for what to do when certain files change
class AutomationRule:
    # When we create a new rule, we need two things:
    def __init__(self, pattern, action):
        # A pattern that tells us which files to watch (like a filter that only shows certain files)
        self.pattern = pattern
        # An action to take when those files change (like what to do when we see something on our camera)
        self.action = action


# Create a FolderWatcher class - think of it as a security guard that watches folders and follows rules
class FolderWatcher(FileSystemEventHandler):
    # When we hire a new security guard, we give them a list of rules to follow
    def __init__(self, rules): 
        # Store the list of rules so our guard knows what to do
        self.rules = rules
        
    # This is what happens when a file is changed (like when our security camera spots movement)
    def on_modified(self, event):
        # Check each rule one by one (like going through a checklist)
        for rule in self.rules:
            # If the changed file matches our pattern (like "is this what we're looking for?")
            if rule.pattern.match(event.src_path):
                # Then do the action we planned (like "sound the alarm!" or "send a text message!")
                rule.action(event.src_path)