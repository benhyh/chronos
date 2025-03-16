import webview
import os
import sys
import time

def main():
    # Create PyWebView window pointing to Vite dev server
    window = webview.create_window(
        'Chronos',
        'http://localhost:5173',  # Vite's default dev server port
        width=1200,
        height=800,
        resizable=True,
        min_size=(800, 600)
    )

    # Start the window
    webview.start(debug=True)

if __name__ == '__main__':
    main() 