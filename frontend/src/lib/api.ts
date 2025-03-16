// This will be replaced with actual PyWebView bridge calls
declare const window: any;

export const api = {
  // Task operations
  getTasks: async () => {
    try {
      return await window.pywebview.api.get_tasks();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  addTask: async (task: any) => {
    try {
      return await window.pywebview.api.add_task(task);
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },

  updateTask: async (task: any) => {
    try {
      return await window.pywebview.api.update_task(task);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  deleteTask: async (taskId: number) => {
    try {
      return await window.pywebview.api.delete_task(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // File operations
  organizeFiles: async (folderPath: string) => {
    try {
      return await window.pywebview.api.organize_files(folderPath);
    } catch (error) {
      console.error('Error organizing files:', error);
      throw error;
    }
  },

  // Schedule operations
  scheduleTask: async (taskId: number, scheduleTime: string) => {
    try {
      return await window.pywebview.api.schedule_task(taskId, scheduleTime);
    } catch (error) {
      console.error('Error scheduling task:', error);
      throw error;
    }
  },
}; 