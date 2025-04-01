import { Home, CheckSquare, FolderClosed } from "lucide-react"
import { ReactNode } from 'react';
import { Button } from './ui/button';

export function Sidebar({ setActiveTab } : { setActiveTab: (tab: string) => void }) {
  return (
    <div className="hidden border-r border-r-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 lg:block lg:w-64 md:w-32 sm:w-16 transition-colors duration-200">
        <div className="flex h-full flex-col">
            <div className="border-b border-b-gray-300 dark:border-gray-800 px-6 py-4">
                <div className="flex items-center">
                    <img src="assets/chronos.png" alt="logo" className="h-12 w-auto mr-2 dark:invert" />
                    <h2 className="text-2xl font-bold dark:text-white">Chronos</h2>
                </div>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
                <Button onClick={() => setActiveTab("dashboard")} variant="ghost" className="w-full justify-start">
                    <SidebarItem icon={<Home size={20} />} label="Dashboard" />
                </Button>
                <Button onClick={() => setActiveTab("tasks")} variant="ghost" className="w-full justify-start">
                    <SidebarItem icon={<CheckSquare size={20} />} label="Task Manager" />
                </Button>
                <Button onClick={() => setActiveTab("files")} variant="ghost" className="w-full justify-start">
                    <SidebarItem icon={<FolderClosed size={20} />} label="File Organizer" />
                </Button>
            </nav>
            <div className="border-t border-t-gray-300 dark:border-gray-800 p-4">
                <div className="rounded-md bg-gray-100 dark:bg-gray-800 p-3">
                    <h3 className="font-medium dark:text-white">Quick Help</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Press F1 anytime to view keyboard shortcuts and help documentation.
                    </p>
                </div>
            </div>
        </div>
    </div>
  )
}

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
}

function SidebarItem({ icon, label }: SidebarItemProps) {
    return (
      <div
        className="flex items-center rounded-md  py-2 text-sm font-medium text-gray-700 dark:text-gray-300  dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
      >
        <span className="mr-3 text-gray-500 dark:text-gray-400">{icon}</span>
        {label}
      </div>
    )
  }
