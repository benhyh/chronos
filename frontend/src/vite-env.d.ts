interface Window {
    pywebview: {
      api: {
        [key: string]: (...args: any[]) => Promise<any>;
        get_all_tasks: () => Promise<import('./lib/api').Task[]>;
        add_task: (title: string, description: string, due_date?: string, priority?: number, status?: number) => Promise<import('./lib/api').Task>;
        update_task: (task_id: string, title: string, description: string, due_date?: string, priority?: number, status?: number) => Promise<import('./lib/api').Task | null>;
        delete_task: (task_id: string) => Promise<boolean>;
        set_task_status: (task_id: string, status: number) => Promise<boolean>;
        complete_task: (task_id: string) => Promise<boolean>;
    };
 };
}

/// <reference types="vite/client" />
