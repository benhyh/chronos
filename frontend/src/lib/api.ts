export type Task = {
  id: string;  
  title: string;
  description: string;
  due_date?: string;
  priority: number;
  status: "Pending" | "In Progress" | "Completed";
  status_code: 0 | 1 | 2;
};
 
const isPyWebViewAvailable = () => {
  if (typeof window === 'undefined') {
    console.error('Window is undefined');
    return false;
  }
  
  if (!window.pywebview) {
    console.error('PyWebView object not found in window');
    console.log('window keys:', Object.keys(window));
    return false;
  }
  
  if (!window.pywebview.api) {
    console.error('PyWebView API object not found');
    console.log('pywebview keys:', Object.keys(window.pywebview));
    return false;
  }
  
  console.log('PyWebView API available with methods:', Object.keys(window.pywebview.api));
  return true;
}
 
type PyWebViewApiArgs = string | number | boolean | null | undefined | Record<string, unknown>;

const callPythonApi = async (method: string, ...args: PyWebViewApiArgs[]) => {
  if (!isPyWebViewAvailable()) {
    console.warn(`PyWebView API not available. Method ${method} called with:`, args);
    
    // Mock response for development/testing when PyWebView is not available
    if (method === 'get_all_tasks') {
      console.log('Returning mock tasks for development');
      return [
        {
          id: "mock-1",
          title: "Mock Task 1",
          description: "This is a mock task for development",
          due_date: "2023-12-31",
          priority: 2,
          status: "Pending",
          status_code: 0
        }
      ];
    }
    
    if (method === 'add_task') {
      const [title, description, due_date, priority, status] = args;
      console.log('Creating mock task for development');
      return {
        id: `mock-${Date.now()}`,
        title: title as string,
        description: description as string,
        due_date: due_date as string,
        priority: priority as number,
        status: status === 0 ? "Pending" : status === 1 ? "In Progress" : "Completed",
        status_code: status as number
      };
    }
    
    return null;
  }

  try {
    return await window.pywebview.api[method](...args);
  } catch(error) {
    console.error(`Error calling Python API method ${method}:`, error);
    throw error;
  }
};

// API wrapper functions
export const api = {
  getAllTasks: async(): Promise<Task[]> => {
    return await callPythonApi('get_all_tasks') || [];
  },

  addTask: async (
    title: string,
    description: string,
    dueDate: string,
    priority: number = 1,
    status: number = 0,
  ): Promise<Task | null> => {
    return await callPythonApi('add_task', title, description, dueDate, priority, status)
  },

  updateTask: async (
    taskId: string,
    title: string,
    description: string,
    dueDate: string,
    priority: number,
    status: number,
  ): Promise<Task | null> => {
    return await callPythonApi('update_task', taskId, title, description, dueDate, priority, status)
  },

  deleteTask: async (taskId: string): Promise<boolean> => {
    return await callPythonApi('delete_task', taskId) || false;
  },

  setTaskStatus: async (taskId: string, status: number): Promise<boolean> => {
    return await callPythonApi('set_task_status', taskId, status) || false;
  },

  completeTask: async (taskId: string): Promise<boolean> => {
    return await callPythonApi('complete_task', taskId) || false;
  }
};

// Map status string to status code for API calls
export const statusToCode: Record<string, number> = {
  "Pending": 0,
  "In Progress": 1,
  "Completed": 2
};

// Map status code to status string for display
export const codeToStatus: Record<number, string> = {
  0: "Pending",
  1: "In Progress",
  2: "Completed"
};

