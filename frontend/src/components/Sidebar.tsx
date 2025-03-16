import { Link } from 'react-router-dom';
import { Home, CheckSquare, FolderClosed, Eye, Clock, Settings } from "lucide-react"
import { ReactNode } from 'react';

export function Sidebar() {
  return (
    <div className="hidden border-r bg-white lg:block lg:w-64 md:w-32 sm:w-16">
        <div className="flex h-full flex-col">
            <div className="border-b px-6 py-4">
                <div className="flex items-center">
                    <img src="assets/chronos.png" alt="logo" className="h-12 w-auto mr-2" />
                    <h2 className="text-2xl font-bold">Chronos</h2>
                </div>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
                <SidebarItem href="/dashboard" icon={<Home size={20} />} label="Dashboard" />
                <SidebarItem href="/tasks" icon={<CheckSquare size={20} />} label="Task Manager" />
                <SidebarItem href="/files" icon={<FolderClosed size={20} />} label="File Organizer" />
                <SidebarItem href="/watcher" icon={<Eye size={20} />} label="Folder Watcher" />
                <SidebarItem href="/scheduler" icon={<Clock size={20} />} label="Task Scheduler" />
                <SidebarItem href="/settings" icon={<Settings size={20} />} label="Settings" />
            </nav>
            <div className="border-t p-4">
                <div className="rounded-md bg-gray-100 p-3">
                    <h3 className="font-medium">Quick Help</h3>
                    <p className="mt-1 text-sm text-gray-600">
                    Press F1 anytime to view keyboard shortcuts and help documentation.
                    </p>
                </div>
            </div>
        </div>
    </div>
  )
}

interface SidebarItemProps {
  href: string;
  icon: ReactNode;
  label: string;
}

function SidebarItem({ href, icon, label }: SidebarItemProps) {
    return (
      <Link
        to={href}
        className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      >
        <span className="mr-3 text-gray-500">{icon}</span>
        {label}
      </Link>
    )
  }
