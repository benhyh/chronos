"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import { Badge } from "./ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Eye, FolderOpen, Plus, Trash2, Clock, AlertTriangle } from "lucide-react"
import { Separator } from "./ui/separator"

// Mock data for watched folders
const watchedFolders = [
  {
    id: 1,
    path: "C:/Users/User/Downloads",
    active: true,
    rules: [
      { id: 1, fileType: "Images", action: "Move to Pictures" },
      { id: 2, fileType: "Documents", action: "Move to Documents" },
    ],
    lastRun: "10 minutes ago",
    status: "Active",
  },
  {
    id: 2,
    path: "C:/Users/User/Desktop",
    active: true,
    rules: [{ id: 3, fileType: "Screenshots", action: "Move to Pictures/Screenshots" }],
    lastRun: "1 hour ago",
    status: "Active",
  },
  {
    id: 3,
    path: "C:/Users/User/Documents/Work",
    active: false,
    rules: [
      { id: 4, fileType: "Spreadsheets", action: "Move to Documents/Spreadsheets" },
      { id: 5, fileType: "PDFs", action: "Move to Documents/PDFs" },
    ],
    lastRun: "Yesterday",
    status: "Inactive",
  },
]

export default function FolderWatcher() {
  const [folders, setFolders] = useState(watchedFolders)

  const toggleFolderActive = (id: number) => {
    setFolders(folders.map((folder) => (folder.id === id ? { ...folder, active: !folder.active } : folder)))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Folder Watcher</h2>
          <p className="text-muted-foreground">Monitor folders and automatically organize files when they change</p>
        </div>
        <Button className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>Add Folder</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Folder to Watch</CardTitle>
          <CardDescription>Set up automatic organization for a folder</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-path">Folder Path</Label>
              <div className="flex space-x-2">
                <Input id="folder-path" placeholder="C:/Path/To/Folder" className="flex-1" />
                <Button variant="outline">Browse...</Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Watch Settings</Label>
              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>Check interval</span>
                  </div>
                  <Select defaultValue="5min">
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1min">1 minute</SelectItem>
                      <SelectItem value="5min">5 minutes</SelectItem>
                      <SelectItem value="15min">15 minutes</SelectItem>
                      <SelectItem value="30min">30 minutes</SelectItem>
                      <SelectItem value="1hour">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>File Rules</Label>
              <div className="space-y-2">
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>Rule 1:</span>
                      <Select defaultValue="images">
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="File type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="images">Images</SelectItem>
                          <SelectItem value="documents">Documents</SelectItem>
                          <SelectItem value="videos">Videos</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                          <SelectItem value="archives">Archives</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select defaultValue="move">
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="move">Move to</SelectItem>
                          <SelectItem value="copy">Copy to</SelectItem>
                          <SelectItem value="rename">Rename</SelectItem>
                          <SelectItem value="delete">Delete</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="Target folder" className="w-[200px]" defaultValue="Pictures" />
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Rule
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button>Save Folder</Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Watched Folders</h3>
        {folders.map((folder) => (
          <Card key={folder.id}>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="h-5 w-5 text-amber-500" />
                    <h4 className="font-medium">{folder.path}</h4>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch checked={folder.active} onCheckedChange={() => toggleFolderActive(folder.id)} />
                      <span>{folder.active ? "Active" : "Inactive"}</span>
                    </div>
                    <Badge variant={folder.active ? "default" : "secondary"}>
                      {folder.active ? <Eye className="mr-1 h-3 w-3" /> : <AlertTriangle className="mr-1 h-3 w-3" />}
                      {folder.status}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <h5 className="mb-2 text-sm font-medium">Rules</h5>
                  <div className="space-y-2">
                    {folder.rules.map((rule) => (
                      <div
                        key={rule.id}
                        className="flex items-center justify-between rounded-md bg-gray-50 p-2 text-sm"
                      >
                        <span>
                          If file is <strong>{rule.fileType}</strong>
                        </span>
                        <span className="text-gray-500">{rule.action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Last run: {folder.lastRun}</span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600">
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

