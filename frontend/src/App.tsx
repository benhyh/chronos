import Dashboard from "./components/Dashboard";
import { Sidebar } from "./components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskManager from "./components/TaskManager";
import Files from "./components/Files";
import Settings from "./components/Settings";
import TaskScheduler from "./components/TaskScheduler";
import FolderWatcher from "./components/FolderWatcher";

export default function App() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-6 text-3xl font-bold tracking-normal">Task Automation Suite</h1>
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger 
                value="dashboard" 
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="tasks"
              >
                Tasks
              </TabsTrigger>
              <TabsTrigger 
                value="files"
              >
                Files
              </TabsTrigger>
              <TabsTrigger 
                value="watcher"
              >
                Watcher
              </TabsTrigger>
              <TabsTrigger 
                value="scheduler"
              >
                Scheduler
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
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
              <Files />
            </TabsContent>

            <TabsContent value="watcher">
              <FolderWatcher/>
            </TabsContent>

            <TabsContent value="scheduler">
              <TaskScheduler/>
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

