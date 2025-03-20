import webview
import os
import sys
import time
from api import TaskAPI

def main():
    task_api = TaskAPI()
    
    # Create PyWebView window pointing to Vite dev server
    window = webview.create_window(
        'Chronos',
        'http://localhost:5173',  # Vite's default dev server port
        width=1200,
        height=800,
        resizable=False,
        min_size=(800, 600),
        js_api=task_api
    )

    # Start the window
    webview.start(debug=True)

if __name__ == '__main__':
    main() 