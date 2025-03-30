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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [newTaskDialogOpen, setNewTaskDialogOpen] = useState(false)
  const [editTaskDialogOpen, setEditTaskDialogOpen] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: 1,
    status: 0 // Default to Pending
  })
  
  // Edit form state
  const [editFormData, setEditFormData] = useState({
    id: "",
    title: "",
    description: "",
    dueDate: "",
    priority: 1,
    status: 0
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

  // Handle input changes for the edit form
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: name === "priority" ? parseInt(value) : value
    }))
  }
  
  // Handle form submission to create a new task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newTask = await api.addTask(
        formData.title,
        formData.description,
        formData.dueDate,
        formData.priority,
        formData.status
      )
      
      console.log("Task creation response:", newTask) // Debug log
      
      // Reset form and refresh tasks
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        priority: 1,
        status: 0
      })
      
      // Close dialog if open
      setNewTaskDialogOpen(false)
      
      fetchTasks()
    } catch (err) {
      console.error("Error creating task:", err)
      setError("Failed to create task")
    }
  }

  // Handle form submission to update an existing task
  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask) return
    
    try {
      await api.updateTask(
        editFormData.id,
        editFormData.title,
        editFormData.description,
        editFormData.dueDate,
        editFormData.priority,
        editFormData.status
      )
      
      // Reset form and refresh tasks
      setEditFormData({
        id: "",
        title: "",
        description: "",
        dueDate: "",
        priority: 1,
        status: 0
      })
      
      setEditingTask(null)
      setEditTaskDialogOpen(false)
      fetchTasks()
    } catch (err) {
      console.error("Error updating task:", err)
      setError("Failed to update task")
    }
  }

  // Handle form submission to update an existing task
  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setEditFormData({
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.due_date || "",
      priority: task.priority,
      status: statusToCode[task.status]
    })
    setEditTaskDialogOpen(true)
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
          <h2 className="text-2xl font-bold tracking-tight dark:text-white">Task Manager</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Create, manage, and track your tasks
          </p>
        </div>
        <Dialog open={newTaskDialogOpen} onOpenChange={setNewTaskDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1 dark:bg-white dark:text-black">
              <PlusCircle className="h-4 w-4" />
              <span>New Task</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="dark:text-white">Create New Task</DialogTitle>
              <DialogDescription className="dark:text-gray-400">Add a new task to your list</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTask}>
              <div className="py-4 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="dark:text-gray-300">Task Title</Label>
                  <Input 
                    id="title" 
                    name="title"
                    placeholder="Enter task title" 
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description"
                    placeholder="Enter task description" 
                    value={formData.description}
                    onChange={handleInputChange}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <Label htmlFor="priority" className="dark:text-gray-300">Priority</Label>
                    <Select 
                      defaultValue="1"
                      value={formData.priority.toString()}
                      onValueChange={(value) => {
                        setFormData(prev => ({
                          ...prev,
                          priority: parseInt(value)
                        }))
                      }}
                    >
                      <SelectTrigger id="priority" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem value="3" className="dark:text-white dark:focus:bg-gray-700">High</SelectItem>
                        <SelectItem value="2" className="dark:text-white dark:focus:bg-gray-700">Medium</SelectItem>
                        <SelectItem value="1" className="dark:text-white dark:focus:bg-gray-700">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status" className="dark:text-gray-300">Status</Label>
                    <Select
                      defaultValue="0"
                      value={formData.status.toString()}
                      onValueChange={(value) => {
                        setFormData(prev => ({
                          ...prev,
                          status: parseInt(value)
                        }))
                      }}
                    >
                      <SelectTrigger id="status" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem value="0" className="dark:text-white dark:focus:bg-gray-700">Pending</SelectItem>
                        <SelectItem value="1" className="dark:text-white dark:focus:bg-gray-700">In Progress</SelectItem>
                        <SelectItem value="2" className="dark:text-white dark:focus:bg-gray-700">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dueDate" className="dark:text-gray-300">Due Date</Label>
                    <Input 
                      id="dueDate" 
                      name="dueDate"
                      type="date" 
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      required
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="flex justify-end">
                <Button type="submit" className="dark:bg-white dark:text-black">Create Task</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editTaskDialogOpen} onOpenChange={setEditTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Edit Task</DialogTitle>
            <DialogDescription className="dark:text-gray-400">Update task details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateTask}>
            <div className="py-4 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Task Title</Label>
                <Input 
                  id="edit-title" 
                  name="title"
                  placeholder="Enter task title" 
                  value={editFormData.title}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  name="description"
                  placeholder="Enter task description" 
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select 
                    value={editFormData.priority.toString()}
                    onValueChange={(value) => {
                      setEditFormData(prev => ({
                        ...prev,
                        priority: parseInt(value)
                      }))
                    }}
                  >
                    <SelectTrigger id="edit-priority">
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
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editFormData.status.toString()}
                    onValueChange={(value) => {
                      setEditFormData(prev => ({
                        ...prev,
                        status: parseInt(value)
                      }))
                    }}
                  >
                    <SelectTrigger id="edit-status">
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
                  <Label htmlFor="edit-dueDate">Due Date</Label>
                  <Input 
                    id="edit-dueDate" 
                    name="dueDate"
                    type="date" 
                    value={editFormData.dueDate}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-end">
              <Button type="submit">Update Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="h-[calc(100%-60px)] overflow-y-auto pb-4">
        {loading ? (
          <div className="flex justify-center p-8 dark:text-white">Loading tasks...</div>
        ) : error ? (
          <div className="flex justify-center p-8 text-red-500">
            {error}
          </div>
        ) : (
          <>
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-8 pb-3 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[180px] dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter" />
                  </div>
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="all" className="dark:text-white dark:focus:bg-gray-700">All Tasks</SelectItem>
                  <SelectItem value="high" className="dark:text-white dark:focus:bg-gray-700">High Priority</SelectItem>
                  <SelectItem value="medium" className="dark:text-white dark:focus:bg-gray-700">Medium Priority</SelectItem>
                  <SelectItem value="low" className="dark:text-white dark:focus:bg-gray-700">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 dark:bg-gray-800">
                <TabsTrigger value="all" className="dark:data-[state=active]:bg-gray-700 dark:text-gray-300 dark:data-[state=active]:text-white">
                  All ({filteredTasks.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="dark:data-[state=active]:bg-gray-700 dark:text-gray-300 dark:data-[state=active]:text-white">
                  Pending ({pendingTasks.length})
                </TabsTrigger>
                <TabsTrigger value="in-progress" className="dark:data-[state=active]:bg-gray-700 dark:text-gray-300 dark:data-[state=active]:text-white">
                  In Progress ({inProgressTasks.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="dark:data-[state=active]:bg-gray-700 dark:text-gray-300 dark:data-[state=active]:text-white">
                  Completed ({completedTasks.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <TaskList 
                  tasks={filteredTasks} 
                  onStatusChange={handleStatusChange} 
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                />
              </TabsContent>

              <TabsContent value="pending" className="mt-4">
                <TaskList 
                  tasks={pendingTasks} 
                  onStatusChange={handleStatusChange} 
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                />
              </TabsContent>

              <TabsContent value="in-progress" className="mt-4">
                <TaskList 
                  tasks={inProgressTasks} 
                  onStatusChange={handleStatusChange} 
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                />
              </TabsContent>

              <TabsContent value="completed" className="mt-4">
                <TaskList 
                  tasks={completedTasks} 
                  onStatusChange={handleStatusChange} 
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                />
              </TabsContent>
            </Tabs>

            <Card className="mt-6 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="dark:border-gray-700">
                <CardTitle className="dark:text-white">Create New Task</CardTitle>
                <CardDescription className="dark:text-gray-400">Add a new task to your list</CardDescription>
              </CardHeader>
              <form onSubmit={handleCreateTask}>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title" className="dark:text-gray-300">Task Title</Label>
                      <Input 
                        id="title" 
                        name="title"
                        placeholder="Enter task title" 
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
                      <Textarea 
                        id="description" 
                        name="description"
                        placeholder="Enter task description" 
                        value={formData.description}
                        onChange={handleInputChange}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="grid gap-2">
                        <Label htmlFor="priority" className="dark:text-gray-300">Priority</Label>
                        <Select 
                          defaultValue="1"
                          value={formData.priority.toString()}
                          onValueChange={(value) => {
                            setFormData(prev => ({
                              ...prev,
                              priority: parseInt(value)
                            }))
                          }}
                        >
                          <SelectTrigger id="priority" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            <SelectItem value="3" className="dark:text-white dark:focus:bg-gray-700">High</SelectItem>
                            <SelectItem value="2" className="dark:text-white dark:focus:bg-gray-700">Medium</SelectItem>
                            <SelectItem value="1" className="dark:text-white dark:focus:bg-gray-700">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status" className="dark:text-gray-300">Status</Label>
                        <Select
                          defaultValue="0"
                          value={formData.status.toString()}
                          onValueChange={(value) => {
                            setFormData(prev => ({
                              ...prev,
                              status: parseInt(value)
                            }))
                          }}
                        >
                          <SelectTrigger id="status" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            <SelectItem value="0" className="dark:text-white dark:focus:bg-gray-700">Pending</SelectItem>
                            <SelectItem value="1" className="dark:text-white dark:focus:bg-gray-700">In Progress</SelectItem>
                            <SelectItem value="2" className="dark:text-white dark:focus:bg-gray-700">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="dueDate" className="dark:text-gray-300">Due Date</Label>
                        <Input 
                          id="dueDate" 
                          name="dueDate"
                          type="date" 
                          value={formData.dueDate}
                          onChange={handleInputChange}
                          required
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end dark:border-gray-700">
                  <Button type="submit" className="dark:bg-white dark:text-black">Create Task</Button>
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
  onDelete,
  onEdit
}: { 
  tasks: Task[]; 
  onStatusChange: (taskId: string, status: number) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
}) {
  if (tasks.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed dark:border-gray-700">
        <div className="text-center">
          <h3 className="text-lg font-medium dark:text-white">No tasks found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create a new task or change your search criteria.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
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
                  className="dark:border-gray-600"
                />
                <div>
                  <h3 className="font-medium dark:text-white">{task.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>
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
                    {task.due_date && <span className="text-xs text-gray-500 dark:text-gray-400">Due: {task.due_date}</span>}
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
                  <SelectTrigger className="w-[140px] dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="Change Status" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    <SelectItem value="0" className="dark:text-white dark:focus:bg-gray-700">Pending</SelectItem>
                    <SelectItem value="1" className="dark:text-white dark:focus:bg-gray-700">In Progress</SelectItem>
                    <SelectItem value="2" className="dark:text-white dark:focus:bg-gray-700">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEdit(task)}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:border-gray-600 dark:hover:bg-red-900/20"
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

