export interface Task {
  id?: number;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  priority?: number;
}

export interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
} 