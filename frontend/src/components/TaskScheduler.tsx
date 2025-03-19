"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Badge } from "./ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Calendar } from "./ui/calendar"
import { AlertCircle, CheckCircle2, RefreshCw, Plus } from "lucide-react"
import { format } from "date-fns"

// Mock data for scheduled tasks
const scheduledTasks = [
  {
    id: 1,
    title: "Weekly Backup",
    description: "Backup important documents to cloud storage",
    schedule: "Every Sunday at 2:00 AM",
    lastRun: "2023-06-04",
    nextRun: "2023-06-11",
    status: "Active",
  },
  {
    id: 2,
    title: "Clean Downloads Folder",
    description: "Organize files in the downloads folder",
    schedule: "Every Monday at 9:00 AM",
    lastRun: "2023-06-05",
    nextRun: "2023-06-12",
    status: "Active",
  },
  {
    id: 3,
    title: "System Scan",
    description: "Scan system for errors and issues",
    schedule: "First day of month at 12:00 PM",
    lastRun: "2023-06-01",
    nextRun: "2023-07-01",
    status: "Active",
  },
  {
    id: 4,
    title: "Archive Old Projects",
    description: "Move completed projects to archive",
    schedule: "Last day of month at 5:00 PM",
    lastRun: "2023-05-31",
    nextRun: "2023-06-30",
    status: "Inactive",
  },
]

export default function TaskScheduler() {
  const [tasks, setTasks] = useState(scheduledTasks)
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="h-full overflow-hidden">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Task Scheduler</h2>
          <p className="text-muted-foreground">Schedule tasks to run automatically at specific times</p>
        </div>
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>New Scheduled Task</span>
        </Button>
      </div>

      <div className="h-[calc(100%-60px)] overflow-y-auto pb-4">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming Tasks</TabsTrigger>
            <TabsTrigger value="history">Task History</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 mt-4">
            {tasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-sm text-gray-500">{task.description}</p>
                      </div>
                      <Badge variant={task.status === "Active" ? "default" : "secondary"}>{task.status}</Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-4 rounded-md bg-gray-50 p-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-gray-500">Schedule</p>
                        <p className="text-sm font-medium">{task.schedule}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Last Run</p>
                        <p className="text-sm font-medium">{task.lastRun}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Next Run</p>
                        <p className="text-sm font-medium">{task.nextRun}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        <span>Run Now</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600">
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Execution History</CardTitle>
                <CardDescription>Recent task execution results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-md border p-4">
                    <div className="flex items-center space-x-4">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <div>
                        <h4 className="font-medium">Weekly Backup</h4>
                        <p className="text-sm text-gray-500">2023-06-04 at 2:00 AM</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-600">
                      Success
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between rounded-md border p-4">
                    <div className="flex items-center space-x-4">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <div>
                        <h4 className="font-medium">Clean Downloads Folder</h4>
                        <p className="text-sm text-gray-500">2023-06-05 at 9:00 AM</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-600">
                      Success
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between rounded-md border p-4">
                    <div className="flex items-center space-x-4">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <div>
                        <h4 className="font-medium">System Scan</h4>
                        <p className="text-sm text-gray-500">2023-06-01 at 12:00 PM</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-red-50 text-red-600">
                      Failed
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between rounded-md border p-4">
                    <div className="flex items-center space-x-4">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <div>
                        <h4 className="font-medium">Archive Old Projects</h4>
                        <p className="text-sm text-gray-500">2023-05-31 at 5:00 PM</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-600">
                      Success
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Calendar</CardTitle>
                <CardDescription>View scheduled tasks on a calendar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                  <div className="md:w-1/2">
                    <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
                  </div>
                  <div className="md:w-1/2">
                    <h3 className="mb-4 font-medium">
                      Tasks for {date ? format(date, "MMMM d, yyyy") : "Selected Date"}
                    </h3>
                    <div className="space-y-2">
                      {date && format(date, "yyyy-MM-dd") === "2023-06-11" ? (
                        <div className="rounded-md border p-3">
                          <h4 className="font-medium">Weekly Backup</h4>
                          <p className="text-sm text-gray-500">2:00 AM</p>
                        </div>
                      ) : date && format(date, "yyyy-MM-dd") === "2023-06-12" ? (
                        <div className="rounded-md border p-3">
                          <h4 className="font-medium">Clean Downloads Folder</h4>
                          <p className="text-sm text-gray-500">9:00 AM</p>
                        </div>
                      ) : date && format(date, "yyyy-MM-dd") === "2023-07-01" ? (
                        <div className="rounded-md border p-3">
                          <h4 className="font-medium">System Scan</h4>
                          <p className="text-sm text-gray-500">12:00 PM</p>
                        </div>
                      ) : date && format(date, "yyyy-MM-dd") === "2023-06-30" ? (
                        <div className="rounded-md border p-3">
                          <h4 className="font-medium">Archive Old Projects</h4>
                          <p className="text-sm text-gray-500">5:00 PM</p>
                        </div>
                      ) : (
                        <div className="rounded-md border border-dashed p-4 text-center">
                          <p className="text-gray-500">No tasks scheduled for this date</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Schedule New Task</CardTitle>
            <CardDescription>Create a new scheduled task</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="task-title">Task Title</Label>
                <Input id="task-title" placeholder="Enter task title" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="task-description">Description</Label>
                <Input id="task-description" placeholder="Enter task description" />
              </div>

              <div className="grid gap-2">
                <Label>Task Type</Label>
                <Select defaultValue="backup">
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backup">Backup</SelectItem>
                    <SelectItem value="cleanup">File Cleanup</SelectItem>
                    <SelectItem value="organize">File Organization</SelectItem>
                    <SelectItem value="scan">System Scan</SelectItem>
                    <SelectItem value="custom">Custom Script</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Frequency</Label>
                  <Select defaultValue="weekly">
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Day</Label>
                  <Select defaultValue="sunday">
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday">Sunday</SelectItem>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="tuesday">Tuesday</SelectItem>
                      <SelectItem value="wednesday">Wednesday</SelectItem>
                      <SelectItem value="thursday">Thursday</SelectItem>
                      <SelectItem value="friday">Friday</SelectItem>
                      <SelectItem value="saturday">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Time</Label>
                <div className="flex space-x-2">
                  <Select defaultValue="2">
                    <SelectTrigger className="w-20">
                      <SelectValue placeholder="Hour" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }).map((_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="flex items-center">:</span>
                  <Select defaultValue="0">
                    <SelectTrigger className="w-20">
                      <SelectValue placeholder="Minute" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 60 }).map((_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select defaultValue="am">
                    <SelectTrigger className="w-20">
                      <SelectValue placeholder="AM/PM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="am">AM</SelectItem>
                      <SelectItem value="pm">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline">Cancel</Button>
            <Button>Schedule Task</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

