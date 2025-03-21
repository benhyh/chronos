"use client"

import { useState, useEffect } from "react"
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
import { api, statusToCode, Task } from "../lib/api"

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [taskCreationAttempts, setTaskCreationAttempts] = useState(0)
  const [taskCreationResponses, setTaskCreationResponses] = useState(0)
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: 1,
    status: 0 // Default to Pending
  })
  
  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks()
  }, [])
  
  // Function to fetch tasks from the Python backend
  const fetchTasks = async () => {
    try {
      setLoading(true)
      const data = await api.getAllTasks()
      console.log("Fetched tasks:", data) // Debug log
      setTasks(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching tasks:", err)
      setError("Failed to fetch tasks")
    } finally {
      setLoading(false)
    }
  }
  
  // Handle input changes for the form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === "priority" ? parseInt(value) : value
    }))
  }
  
  // Handle form submission to create a new task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setTaskCreationAttempts(prev => prev + 1)
    try {
      const newTask = await api.addTask(
        formData.title,
        formData.description,
        formData.dueDate,
        formData.priority,
        formData.status
      )
      
      console.log("Task creation response:", newTask) // Debug log
      setTaskCreationResponses(prev => prev + 1)
      
      // Reset form and refresh tasks
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        priority: 1,
        status: 0
      })
      
      fetchTasks()
    } catch (err) {
      console.error("Error creating task:", err)
      setError("Failed to create task")
    }
  }
  
  // Function to update task status
  const handleStatusChange = async (taskId: string, newStatus: number) => {
    try {
      await api.setTaskStatus(taskId, newStatus)
      fetchTasks()
    } catch (err) {
      console.error("Error updating task status:", err)
      setError("Failed to update task status")
    }
  }
  
  // Function to delete a task
  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId)
      fetchTasks()
    } catch (err) {
      console.error("Error deleting task:", err)
      setError("Failed to delete task")
    }
  }

  // Filter tasks based on search query
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
          <p className="text-gray-500">
            Create, manage, and track your tasks
          </p>
        </div>
        <Button className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4" />
          <span>New Task</span>
        </Button>
      </div>

      <div className="h-[calc(100%-60px)] overflow-y-auto pb-4">
        {loading ? (
          <div className="flex justify-center p-8">Loading tasks...</div>
        ) : error ? (
          <div className="flex justify-center p-8 text-red-500">{error}</div>
        ) : (
          <>
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-8 pb-3"
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
                <TaskList 
                  tasks={filteredTasks} 
                  onStatusChange={handleStatusChange} 
                  onDelete={handleDeleteTask} 
                />
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                <TaskList 
                  tasks={pendingTasks} 
                  onStatusChange={handleStatusChange} 
                  onDelete={handleDeleteTask} 
                />
              </TabsContent>

              <TabsContent value="in-progress" className="mt-4">
                <TaskList 
                  tasks={inProgressTasks} 
                  onStatusChange={handleStatusChange} 
                  onDelete={handleDeleteTask} 
                />
              </TabsContent>

              <TabsContent value="completed" className="mt-4">
                <TaskList 
                  tasks={completedTasks} 
                  onStatusChange={handleStatusChange} 
                  onDelete={handleDeleteTask} 
                />
              </TabsContent>
            </Tabs>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Create New Task</CardTitle>
                <CardDescription>Add a new task to your list</CardDescription>
              </CardHeader>
              <form onSubmit={handleCreateTask}>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Task Title</Label>
                      <Input 
                        id="title" 
                        name="title"
                        placeholder="Enter task title" 
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        name="description"
                        placeholder="Enter task description" 
                        value={formData.description}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="grid gap-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select 
                          defaultValue="1"
                          onValueChange={(value) => {
                            setFormData(prev => ({
                              ...prev,
                              priority: parseInt(value)
                            }))
                          }}
                        >
                          <SelectTrigger id="priority">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">High</SelectItem>
                            <SelectItem value="2">Medium</SelectItem>
                            <SelectItem value="1">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          defaultValue="0"
                          onValueChange={(value) => {
                            setFormData(prev => ({
                              ...prev,
                              status: parseInt(value)
                            }))
                          }}
                        >
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Pending</SelectItem>
                            <SelectItem value="1">In Progress</SelectItem>
                            <SelectItem value="2">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input 
                          id="dueDate" 
                          name="dueDate"
                          type="date" 
                          value={formData.dueDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit">Create Task</Button>
                </CardFooter>
              </form>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

function TaskList({ 
  tasks, 
  onStatusChange, 
  onDelete 
}: { 
  tasks: Task[]; 
  onStatusChange: (taskId: string, status: number) => void;
  onDelete: (taskId: string) => void;
}) {
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
              task.priority === 3 ? "bg-red-500" : task.priority === 2 ? "bg-amber-500" : "bg-green-500"
            }`}
          />
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Checkbox 
                  id={`task-${task.id}`}
                  checked={task.status === "Completed"}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onStatusChange(task.id, 2); // 2 = Completed
                    } else {
                      onStatusChange(task.id, 0); // 0 = Pending
                    }
                  }}
                />
                <div>
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-gray-500">{task.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge
                      className={
                        task.priority === 3
                          ? "bg-red-500 text-white hover:bg-red-600" 
                          : task.priority === 2
                            ? "bg-orange-500 text-white hover:bg-orange-600" 
                            : "bg-green-500 text-white hover:bg-green-600"
                      }
                    >
                      {task.priority === 3 ? "High" : task.priority === 2 ? "Medium" : "Low"}
                    </Badge>
                    <Badge
                      className={
                        task.status === "Completed"
                          ? "bg-black text-white hover:bg-black/90"
                          : task.status === "In Progress"
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "bg-gray-500 text-white hover:bg-gray-600"
                      }
                    >
                      {task.status === "Completed" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                      {task.status === "In Progress" && <Clock className="mr-1 h-3 w-3" />}
                      {task.status === "Pending" && <AlertCircle className="mr-1 h-3 w-3" />}
                      {task.status}
                    </Badge>
                    {task.due_date && <span className="text-xs text-gray-500">Due: {task.due_date}</span>}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Select
                  defaultValue={statusToCode[task.status].toString()}
                  onValueChange={(value) => {
                    onStatusChange(task.id, parseInt(value));
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Change Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Pending</SelectItem>
                    <SelectItem value="1">In Progress</SelectItem>
                    <SelectItem value="2">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => onDelete(task.id)}
                >
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

