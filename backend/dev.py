import os
import sys
import subprocess
import venv
import time
import shutil

def check_npm():
    """Check if npm is installed"""
    if not shutil.which('npm'):
        print("Error: npm is not installed or not in PATH")
        print("Please install Node.js from https://nodejs.org/")
        sys.exit(1)

def setup_venv():
    """Set up Python virtual environment if it doesn't exist"""
    if not os.path.exists('venv'):
        print("Creating virtual environment...")
        venv.create('venv', with_pip=True)
    
    # Get the path to the virtual environment's Python executable
    if sys.platform == 'win32':
        python_path = os.path.join('venv', 'Scripts', 'python.exe')
    else:
        python_path = os.path.join('venv', 'bin', 'python')
    
    return python_path

def install_dependencies(python_path):
    """Install Python dependencies"""
    print("Installing Python dependencies...")
    try:
        subprocess.run([python_path, '-m', 'pip', 'install', '-r', 'requirements.txt'], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error installing Python dependencies: {e}")
        sys.exit(1)

def start_frontend_dev():
    """Start the frontend development server"""
    print("Starting frontend development server...")
    try:
        # Get the absolute path to the frontend directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        frontend_path = os.path.join(os.path.dirname(current_dir), 'frontend')
        
        if not os.path.exists(frontend_path):
            print(f"Error: Frontend directory not found at {frontend_path}")
            sys.exit(1)
            
        print(f"Found frontend directory at: {frontend_path}")
        
        # Store the current directory
        original_dir = os.getcwd()
        
        try:
            # Change to frontend directory
            os.chdir(frontend_path)
            print(f"Changed to directory: {os.getcwd()}")
            
            # Start the development server in a separate process
            if sys.platform == 'win32':
                subprocess.Popen(['npm', 'run', 'dev'], 
                               creationflags=subprocess.CREATE_NEW_CONSOLE)
            else:
                subprocess.Popen(['npm', 'run', 'dev'])
                
        finally:
            # Always change back to the original directory
            os.chdir(original_dir)
            
    except Exception as e:
        print(f"Error starting frontend server: {e}")
        sys.exit(1)

def main():
    # Check for npm
    check_npm()
    
    # Set up Python environment
    python_path = setup_venv()
    install_dependencies(python_path)
    
    # Start frontend development server
    start_frontend_dev()
    
    # Wait a bit for the frontend server to start
    print("Waiting for frontend server to start...")
    time.sleep(5)
    
    # Run the PyWebView development server
    print("Starting PyWebView development server...")
    try:
        subprocess.run([python_path, 'src/dev_server.py'], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error running development server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main() 