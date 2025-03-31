import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, FolderOpen, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<CheckCircle className="h-8 w-8 text-green-500" />}
          title="Tasks Completed"
          value="12"
          description="This week"
        />
        <StatCard
          icon={<Clock className="h-8 w-8 text-blue-500" />}
          title="Scheduled Tasks"
          value="5"
          description="Upcoming"
        />
        <StatCard
          icon={<FolderOpen className="h-8 w-8 text-amber-500" />}
          title="Files Organized"
          value="128"
          description="This month"
        />
        <StatCard
          icon={<AlertCircle className="h-8 w-8 text-red-500" />}
          title="Pending Tasks"
          value="3"
          description="Overdue"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest automation activities</CardDescription>
          </CardHeader>
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
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Progress</CardTitle>
            <CardDescription>Current status of your tasks</CardDescription>
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
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs text-gray-500">{description}</p>
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
          <p className="font-medium">{title}</p>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
        <p className="text-sm text-gray-500">{description}</p>
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
        <p className="font-medium">{title}</p>
        <span
          className={`text-xs ${
            status === "Completed" ? "text-green-500" : status === "In Progress" ? "text-blue-500" : "text-gray-500"
          }`}
        >
          {status}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-gray-500">{progress}% complete</p>
    </div>
  )
}

