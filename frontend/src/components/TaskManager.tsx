"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Badge } from "./ui/badge"
import { Checkbox } from "./ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { PlusCircle, Search, Filter, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { Textarea } from "./ui/textarea"

// Mock data for tasks
const mockTasks = [
  {
    id: 1,
    title: "Update project documentation",
    description: "Add new features to the docs",
    priority: "High",
    status: "Pending",
    dueDate: "2023-06-15",
  },
  {
    id: 2,
    title: "Backup database",
    description: "Weekly backup of the main database",
    priority: "Medium",
    status: "Completed",
    dueDate: "2023-06-10",
  },
  {
    id: 3,
    title: "Clean downloads folder",
    description: "Organize files by type",
    priority: "Low",
    status: "Pending",
    dueDate: "2023-06-20",
  },
  {
    id: 4,
    title: "Update software",
    description: "Install latest updates",
    priority: "Medium",
    status: "In Progress",
    dueDate: "2023-06-18",
  },
  {
    id: 5,
    title: "Review logs",
    description: "Check system logs for errors",
    priority: "High",
    status: "Pending",
    dueDate: "2023-06-12",
  },
]

export default function TaskManager() {
  const [tasks, setTasks] = useState(mockTasks)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const pendingTasks = filteredTasks.filter((task) => task.status === "Pending")
  const inProgressTasks = filteredTasks.filter((task) => task.status === "In Progress")
  const completedTasks = filteredTasks.filter((task) => task.status === "Completed")

  return (
    <div className="h-full overflow-hidden">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Task Manager</h2>
          <p className="text-muted-foreground">Create, manage, and track your tasks</p>
        </div>
        <Button className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4" />
          <span>New Task</span>
        </Button>
      </div>

      <div className="h-[calc(100%-60px)] overflow-y-auto pb-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search tasks..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({filteredTasks.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingTasks.length})</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress ({inProgressTasks.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <TaskList tasks={filteredTasks} />
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            <TaskList tasks={pendingTasks} />
          </TabsContent>

          <TabsContent value="in-progress" className="mt-4">
            <TaskList tasks={inProgressTasks} />
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            <TaskList tasks={completedTasks} />
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Create New Task</CardTitle>
            <CardDescription>Add a new task to your list</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Task Title</Label>
                <Input id="title" placeholder="Enter task title" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Enter task description" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue="pending">
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input id="due-date" type="date" />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button>Create Task</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

function TaskList({ tasks }: { tasks: any[] }) {
  if (tasks.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
        <div className="text-center">
          <h3 className="text-lg font-medium">No tasks found</h3>
          <p className="text-sm text-gray-500">Create a new task or change your search criteria.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="overflow-hidden">
          <div
            className={`h-1 w-full ${
              task.priority === "High" ? "bg-red-500" : task.priority === "Medium" ? "bg-amber-500" : "bg-green-500"
            }`}
          />
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Checkbox id={`task-${task.id}`} checked={task.status === "Completed"} />
                <div>
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-gray-500">{task.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        task.priority === "High" ? "destructive" : task.priority === "Medium" ? "default" : "outline"
                      }
                      className={
                        task.priority === "High" 
                          ? "bg-red-500 text-white hover:bg-red-600" 
                          : task.priority === "Medium" 
                            ? "bg-orange-500 text-white hover:bg-orange-600" 
                            : "bg-green-500 text-white hover:bg-green-600"
                      }
                    >
                      {task.priority}
                    </Badge>
                    <Badge
                      variant={
                        task.status === "Completed"
                          ? "outline"
                          : task.status === "In Progress"
                            ? "secondary"
                            : "default"
                      }
                      className={
                        task.status === "Completed"
                          ? "bg-black text-white hover:bg-black/90"
                          : task.status === "In Progress"
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "bg-gray-100 text-black hover:bg-gray-200"
                      }
                    >
                      {task.status === "Completed" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                      {task.status === "In Progress" && <Clock className="mr-1 h-3 w-3" />}
                      {task.status === "Pending" && <AlertCircle className="mr-1 h-3 w-3" />}
                      {task.status}
                    </Badge>
                    <span className="text-xs text-gray-500">Due: {task.dueDate}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant= "outline" size="sm">
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
    </div>
  )
}

