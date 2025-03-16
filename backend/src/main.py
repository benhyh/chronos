import tkinter as tk

from gui import AutomationGUI

def main():
    # Create the main window - like building the robot's body
    root = tk.Tk()
    
    # Set the window size - like deciding how big our robot should be
    root.geometry("800x600")
    
    # Create our GUI application - like bringing the robot to life
    app = AutomationGUI(root)
    
    # Set up what happens when the window is closed - like adding an "off" switch
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    
    # Start the main loop - like turning on the robot and letting it run
    # This keeps our app running until the user closes it
    root.mainloop()

# This special code checks if this file is being run directly (not imported by another file)
# It's like saying "only start the robot if someone presses the power button"
if __name__ == "__main__":
    # Call our main function to start the application
    main() 