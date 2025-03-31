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
          folder_name: string,
          desired_folder_directory: string,
          extensions: string[]
        ) => Promise<{
          id: string;
          base_folder_directory: string;
          desired_folder_directory: string;
          folder_name: string;
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
        get_dashboard_stats: () => Promise<import('./lib/api').DashboardStats[]>;
        delete_organization_rule: (rule_id: string, base_folder?: string) => Promise<boolean>;
        clear_organization_rules: (base_folder?: string) => Promise<boolean>;
        organize_files: (misplaced_files: Array<{
          id: string;
          name: string;
          type: string;
          path: string;
          current_folder: string;
          correct_folder: string;
          source_path: string;
          destination_path: string;
        }>) => Promise<boolean>;
    };
        update_organization_rule: (
          rule_id: string,
          base_folder_directory: string,
          folder_name: string,
          desired_folder_directory: string,
          extensions: string[]
        ) => Promise<{
          id: string;
          base_folder_directory: string;
          desired_folder_directory: string;
          folder_name: string;
          extensions: string[],
          full_path: string;
          enabled: boolean;
        }>
 };
}

/// <reference types="vite/client" />
