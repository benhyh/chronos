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
        select_folder: () => Promise<string | null>;
        scan_folder: (folderPath: string) => Promise<import('./lib/api').FileSystemItem[]>;
        add_organization_rule: (
          base_folder_directory: string,
          folder: string,
          extensions: string[]
        ) => Promise<{
          id: string;
          base_folder_directory: string;
          folder: string;
          extensions: string[]
          full_path: string;
          enabled: boolean;
        }>;
        get_organization_rules: (base_folder?: string) => Promise<Array<{
          id: string;
          base_folder: string;
          folder_name: string;
          full_path: string;
          extensions: string[];
          enabled: boolean;
        }>>;
        delete_organization_rule: (rule_id: string, base_folder?: string) => Promise<boolean>;
        clear_organization_rules: (base_folder?: string) => Promise<boolean>;
    };
 };
}

/// <reference types="vite/client" />
