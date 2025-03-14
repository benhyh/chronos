# Import a tool that helps us work with dates and times (like a digital calendar)
from datetime import datetime

# Import a special helper that lets us schedule tasks (like setting an alarm clock)
import schedule

# Import a tool that lets our program wait or sleep (like taking a short nap) 
import time

# Create a TaskScheduler class - think of it as an alarm clock for our program
class TaskScheduler():
    # When we create a new scheduler, we set up an empty list to store our alarms
    def __init__(self):
        # This is like a notebook where we write down all our scheduled tasks.
        self.scheduled_tasks = {}
    
    # This is how we add a new alarm to our clock
    def add_scheduled_task(self, task, schedule_time):
        # Tell the schedule tool to run our task every day at the specific time
        # (Like telling your alarm: "Wake me up at 7:00 AM every day")

        schedule.every().day.at(schedule_time).do(task)
        
        # Write down this task in our notebook so we remember it
        # We use the task's name as a label (like writing "Wake up" on your alarm)
        self.scheduled_tasks[task.__name__] = schedule_time
    
    # This method runs all our scheduled tasks (like letting all alarms ring when it's time)
    def run_pending_tasks(self):
        # Check if any alarms need to ring right now
        schedule.run_pending()
    
    # This method keeps checking our alarms forever (like a real alarm clock that's always on)
    def start_scheduler(self):
        # Keep doing this forever (or until someone stops the program)
        while True:
            # Check if any tasks need to run
            self.run_pending_tasks()
            # Wait a little bit before checking again (like hitting snooze for 1 second)
            time.sleep(1)


