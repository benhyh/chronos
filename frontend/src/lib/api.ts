export type Task = {
  id: string;  
  title: string;
  description: string;
  due_date?: string;
  priority: number;
  status: "Pending" | "In Progress" | "Completed";
  status_code: 0 | 1 | 2;
};

export interface FileSystemItem {
  id: string;
  name: string;
  type: "file" | "folder";
  path?: string;
  size?: string ;
  extension: string;
  children?: FileSystemItem[];
}

export interface MisplacedFile extends FileSystemItem {
  current_folder: string;
  correct_folder: string;
  source_path: string;
  destination_path: string;
}

export interface OrganizationRule {
  id: string;
  base_folder_directory: string;
  desired_folder_directory: string;
  folder_name: string;
  full_path: string;
  extensions: string[];
  enabled: boolean;
}
 
const isPyWebViewAvailable = (): boolean => {
  return typeof window !== 'undefined' && 
          window.pywebview !== undefined && 
          window.pywebview.api !== undefined;
}
  
type PyWebViewApiArgs = string | number | boolean | null | undefined | Record<string, unknown> | string[] | MisplacedFile[];

const callPythonApi = async (method: string, ...args: PyWebViewApiArgs[]) => {
  if (!isPyWebViewAvailable()) {
    console.warn(`PyWebView API not available. Method ${method} called with:`, args);
    return null;
  } // not avaliable for web browser - run dev rver with backend

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
  },

  select_folder: async(): Promise<string | null> => {
    return await callPythonApi('select_folder') || false;
  },

  scan_folder: async(folderPath: string): Promise<FileSystemItem[]> => {
    return await callPythonApi('scan_folder', folderPath) || false;
  },

  add_organization_rule: async(
    base_folder_directory: string,
    folder_name: string,
    desired_folder_directory: string,
    extensions: string[]
  ): Promise<OrganizationRule> => {
    return await callPythonApi('add_organization_rule', base_folder_directory, folder_name, desired_folder_directory, extensions);
  },
  
  organize_files: async(
    misplaced_files: MisplacedFile[],
  ): Promise<boolean> => {
    return await callPythonApi('organize_files', misplaced_files) || false;
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

