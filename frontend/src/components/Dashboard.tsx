import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { CheckCircle, FolderOpen, AlertCircle, FileText, BarChart2 } from "lucide-react"
import { Button } from './ui/button';

const Dashboard = () => {
  const activityStatus = 0;
  const taskStatus = 0
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<CheckCircle className="h-8 w-8 text-green-500" />}
          title="Tasks Completed"
          value="0"
          description="This week"
        />
        <StatCard
          icon={<FolderOpen className="h-8 w-8 text-amber-500" />}
          title="Files Organized"
          value="0"
          description="This month"
        />
        <StatCard
          icon={<AlertCircle className="h-8 w-8 text-red-500" />}
          title="Pending Tasks"
          value="0"
          description="Overdue"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="dark:border-gray-700">
            <CardTitle className="dark:text-white">Recent Activity</CardTitle>
            <CardDescription className="dark:text-gray-400">Your latest activities</CardDescription>
          </CardHeader>
          {activityStatus == 0 ? (
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium dark:text-white">No recent activity</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                  Your recent activities will appear here once you start using the application.
                </p>
                <div className="mt-6 flex gap-2">
                  <Button variant="outline" size="sm" className="dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:border-gray-600">
                    Create a Task
                  </Button>
                  <Button variant="outline" size="sm" className="dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:border-gray-600">
                    Organize Files
                  </Button>
                </div>
              </div>
            </CardContent>
          ) : (
            <CardContent>
              <div className="space-y-4">
                <ActivityItem
                  title="Files organized in Downloads folder"
                  time="10 minutes ago"
                  description="15 files moved to appropriate folders"
                />
                <ActivityItem
                  title="Backup task completed"
                  time="2 hours ago"
                  description="Documents backed up to cloud storage"
                />
                <ActivityItem
                  title="New task created"
                  time="Yesterday"
                  description="Weekly report generation scheduled"
                />
                <ActivityItem
                  title="Folder watcher added"
                  time="2 days ago"
                  description="Watching Desktop for new screenshots"
                />
              </div>
            </CardContent>
          )}
        </Card>

        {taskStatus == 0 ? (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="dark:border-gray-700">
              <CardTitle className="dark:text-white">Task Progress</CardTitle>
              <CardDescription className="dark:text-gray-400">Current status of your tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BarChart2 className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium dark:text-white">No tasks in progress</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                  Create tasks to track your progress and see them here.
                </p>
                <Button className="mt-6 dark:bg-white dark:text-black" size="sm">
                  Create a Task
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="dark:border-gray-700">
              <CardTitle className="dark:text-white">Task Progress</CardTitle>
              <CardDescription className="dark:text-gray-400">Current status of your tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ProgressItem title="Weekly File Cleanup" progress={75} status="In Progress" />
                <ProgressItem title="Database Backup" progress={100} status="Completed" />
                <ProgressItem title="Report Generation" progress={30} status="In Progress" />
                <ProgressItem title="Email Organization" progress={0} status="Not Started" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode
  title: string
  value: string
  description: string
}) {
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({
  title,
  time,
  description,
}: {
  title: string
  time: string
  description: string
}) {
  return (
    <div className="flex items-start space-x-4">
      <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-500" />
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <p className="font-medium dark:text-white">{title}</p>
          <span className="text-xs text-gray-500 dark:text-gray-400">{time}</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
  )
}

function ProgressItem({
  title,
  progress,
  status,
}: {
  title: string
  progress: number
  status: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-medium dark:text-white">{title}</p>
        <span
          className={`text-xs ${
            status === "Completed" ? "text-green-500" : status === "In Progress" ? "text-blue-500" : "text-gray-500"
          }`}
        >
          {status}
        </span>
      </div>
      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
        <div 
          className={`h-full rounded-full ${
            status === "Completed" ? "bg-green-500" : status === "In Progress" ? "bg-blue-500" : "bg-gray-300"
          }`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{progress}% complete</p>
    </div>
  )
}

export default Dashboard
