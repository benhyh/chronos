import os
import sys
import subprocess
import shutil
import webview
from pathlib import Path

def build_frontend():
    """Build the frontend for production"""
    print("Building frontend...")
    try:
        # Get the absolute path to the frontend directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        frontend_path = os.path.join(os.path.dirname(current_dir), 'frontend')
        
        if not os.path.exists(frontend_path):
            print(f"Error: Frontend directory not found at {frontend_path}")
            sys.exit(1)
            
        # Store the current directory
        original_dir = os.getcwd()
        
        try:
            # Change to frontend directory
            os.chdir(frontend_path)
            
            # Build the frontend
            subprocess.run(['npm', 'run', 'build'], check=True)
            
        finally:
            # Always change back to the original directory
            os.chdir(original_dir)
            
    except subprocess.CalledProcessError as e:
        print(f"Error building frontend: {e}")
        sys.exit(1)

def create_dist():
    """Create distribution directory"""
    if os.path.exists('dist'):
        shutil.rmtree('dist')
    os.makedirs('dist')

def copy_files():
    """Copy necessary files to dist directory"""
    # Get the absolute path to the frontend directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_path = os.path.join(os.path.dirname(current_dir), 'frontend')
    
    # Copy frontend build
    frontend_dist = os.path.join(frontend_path, 'dist')
    if not os.path.exists(frontend_dist):
        print("Error: Frontend build not found. Run build_frontend() first.")
        sys.exit(1)
        
    shutil.copytree(frontend_dist, 'dist/frontend')
    
    # Copy Python files
    shutil.copytree('src', 'dist/src')
    
    # Copy data directory
    shutil.copytree('data', 'dist/data')
    
    # Copy requirements
    shutil.copy('requirements.txt', 'dist/')

def create_main():
    """Create the main entry point for the packaged application"""
    main_content = '''
import webview
import os
import sys

def get_html_path():
    if getattr(sys, 'frozen', False):
        # Running in PyInstaller bundle
        return os.path.join(sys._MEIPASS, 'frontend', 'index.html')
    else:
        # Running in normal Python environment
        return os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend', 'index.html')

def main():
    window = webview.create_window(
        'Chronos',
        get_html_path(),
        width=1200,
        height=800,
        resizable=True,
        min_size=(800, 600)
    )
    webview.start()

if __name__ == '__main__':
    main()
'''
    with open('dist/main.py', 'w') as f:
        f.write(main_content)

def main():
    # Build frontend
    build_frontend()
    
    # Create distribution directory
    create_dist()
    
    # Copy files
    copy_files()
    
    # Create main entry point
    create_main()
    
    print("Build complete! Distribution files are in the 'dist' directory.")
    print("To run the application:")
    print("1. cd dist")
    print("2. pip install -r requirements.txt")
    print("3. python main.py")

if __name__ == '__main__':
    main() 