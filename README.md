# Chronos 

A simple, user-friendly application for managing tasks, automating file organization, and scheduling tasks!

## Features

- **Task Management**: Create, view, and complete tasks
- **File Organization**: Automatically organize files by extension
- **Folder Watching**: Set up rules to automatically organize files when they change
- **Task Scheduling**: Schedule tasks to be completed at specific times
- **Data Storage**: Save tasks to JSON files or a SQLite database

## Technology Stack

- **Frontend**:
  - React with TypeScript
  - Vite for development and building
  - Tailwind CSS for styling
  - Radix UI for components

- **Backend**:
  - Python 3.11+ (recommended)
  - PyWebView for desktop app framework
  - SQLite for local data storage
  - Pydantic for data validation

## Prerequisites

- **Python 3.11 or 3.12** (3.13+ may have package compatibility issues)
- **Node.js 18+** and npm
- **Git**

## Setup Instructions 

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chronos
   ```

2. **Create and activate virtual environment**
   ```bash
   cd backend
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

### Frontend Setup

1. **Install Node.js dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

## Running the Application

### Development Mode

You need to run both frontend and backend servers:

1. **Start the frontend dev server**
   ```bash
   cd frontend
   npm run dev
   ```
   This starts the Vite development server on http://localhost:5173

2. **Start the PyWebView application** (in a new terminal)
   ```bash
   cd backend
   venv\Scripts\activate  # Windows
   python src/dev_server.py
   ```
   This opens a PyWebView window that loads the frontend

### Production Build

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Run the production application**
   ```bash
   cd ../backend
   python build.py
   ```

## Project Structure

```
chronos/
├── backend/
│   ├── src/
│   │   ├── api.py           # Main API interface
│   │   ├── dev_server.py    # Development entry point
│   │   ├── main.py          # Production entry point
│   │   ├── task_manager.py  # Task management logic
│   │   ├── storage.py       # Database operations
│   │   └── ...
│   ├── requirements.txt
│   └── tasks.db            # SQLite database (auto-created)
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── lib/           # API interface and utilities
│   │   └── ...
│   ├── package.json
│   └── ...
└── data/
    └── tasks.json         # JSON backup storage
```

## Environment Variables

**No environment variables or API keys are required.** The application is completely self-contained and uses:
- Local SQLite database for data persistence
- Local file system operations for file organization
- PyWebView bridge for frontend-backend communication

## Feedback / Issues

The best way to contact me is @  bhyh.003@gmail.com - If you do reach out, I'm grateful for your feedback and I appreciate your time 💜