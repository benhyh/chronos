declare const window: any;

export type Task = {
  id: number,
  title: string,
  description: string,
  due_date?: string,
  priority: number,
  status: "Pending" | "In Progress" | "Completed";
}
 
const isPyWebViewAvailable = () => {
  return window.pywebview !== undefined;
}

const callPythonApi = async (method: string, ...args: any[]) => {
  if (!isPyWebViewAvailable()) {
    console.warn(`PyWebView API is not avaliable. Method ${method} called with:`, args);
    return null;
  }

  try {
    return await window.pywebview.api[method](...args);
  } catch(error) {
    console.error(`Error calling Python API method ${method}`, error);
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
    dueDate?: string,
    priority: number = 1,
    status: number = 0
  ): Promise<Task | null> => {
    return await callPythonApi('add_task', title, description, dueDate, priority, status)
  },

  updateTask: async (
    taskId: number,
    title: string,
    description: string,
    dueDate?: string,
    priority?: number,
    status?: number,
  ): Promise<Task | null> => {
    return await callPythonApi('update_task', taskId, title, description, dueDate, priority, status)
  },

  deleteTask: async (taskId: number): Promise<boolean> => {
    return await callPythonApi('delete_task', taskId) || false;
  },

  setTaskStatus: async (taskId: number, status: number): Promise<boolean> => {
    return await callPythonApi('set_task_status', taskId, status) || false;
  },

  completeTask: async (taskId: number): Promise<boolean> => {
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