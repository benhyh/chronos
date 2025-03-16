import { Sidebar } from "./components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Basic route components
const Dashboard = () => <div className="p-6">Dashboard Content</div>;
const TaskManager = () => <div className="p-6">Task Manager Content</div>;
const FileOrganizer = () => <div className="p-6">File Organizer Content</div>;
const FolderWatcher = () => <div className="p-6">Folder Watcher Content</div>;
const TaskScheduler = () => <div className="p-6">Task Scheduler Content</div>;
const Settings = () => <div className="p-6">Settings Content</div>;

export default function App() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-6 text-3xl font-bold tracking-normal">Task Automation Suite</h1>
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-gray-100">
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-bold"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="tasks"
                className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-bold"
              >
                Tasks
              </TabsTrigger>
              <TabsTrigger 
                value="files"
                className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-bold"
              >
                Files
              </TabsTrigger>
              <TabsTrigger 
                value="watcher"
                className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-bold"
              >
                Watcher
              </TabsTrigger>
              <TabsTrigger 
                value="scheduler"
                className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-bold"
              >
                Scheduler
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:font-bold"
              >
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <Dashboard />
            </TabsContent>

            <TabsContent value="tasks">
              <TaskManager />
            </TabsContent>

            <TabsContent value="files">
              <FileOrganizer />
            </TabsContent>

            <TabsContent value="watcher">
              <FolderWatcher />
            </TabsContent>

            <TabsContent value="scheduler">
              <TaskScheduler />
            </TabsContent>

            <TabsContent value="settings">
              <Settings />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

