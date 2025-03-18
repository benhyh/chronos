"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, FileText, Image, Film, Music, Archive, Code, File } from "lucide-react"
import { Progress } from "@/components/ui/progress"

// Mock data for file types
const fileTypes = [
  {
    id: 1,
    extension: ".jpg, .png, .gif",
    category: "Images",
    icon: <Image className="h-5 w-5" />,
    color: "bg-blue-500",
    count: 156,
  },
  {
    id: 2,
    extension: ".doc, .docx, .pdf, .txt",
    category: "Documents",
    icon: <FileText className="h-5 w-5" />,
    color: "bg-amber-500",
    count: 89,
  },
  {
    id: 3,
    extension: ".mp4, .avi, .mov",
    category: "Videos",
    icon: <Film className="h-5 w-5" />,
    color: "bg-red-500",
    count: 32,
  },
  {
    id: 4,
    extension: ".mp3, .wav, .flac",
    category: "Audio",
    icon: <Music className="h-5 w-5" />,
    color: "bg-green-500",
    count: 64,
  },
  {
    id: 5,
    extension: ".zip, .rar, .7z",
    category: "Archives",
    icon: <Archive className="h-5 w-5" />,
    color: "bg-purple-500",
    count: 17,
  },
  {
    id: 6,
    extension: ".js, .py, .html, .css",
    category: "Code",
    icon: <Code className="h-5 w-5" />,
    color: "bg-gray-500",
    count: 43,
  },
  { id: 7, extension: "other", category: "Other", icon: <File className="h-5 w-5" />, color: "bg-gray-400", count: 28 },
]

// Mock data for recent files
const recentFiles = [
  { id: 1, name: "project_report.docx", path: "Documents/Work", size: "2.4 MB", date: "2023-06-10" },
  { id: 2, name: "vacation_photo.jpg", path: "Pictures/Vacation", size: "3.8 MB", date: "2023-06-09" },
  { id: 3, name: "presentation.pptx", path: "Documents/Presentations", size: "5.1 MB", date: "2023-06-08" },
  { id: 4, name: "budget.xlsx", path: "Documents/Finance", size: "1.2 MB", date: "2023-06-07" },
  { id: 5, name: "song.mp3", path: "Music/Favorites", size: "8.7 MB", date: "2023-06-06" },
]

export default function FileOrganizer() {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    // Handle file drop logic here
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">File Organizer</h2>
          <p className="text-muted-foreground">Organize your files by type and category</p>
        </div>
        <Button>Organize Files</Button>
      </div>

      <div
        className={`flex h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
          dragActive ? "border-primary bg-primary/10" : "border-gray-300"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <FolderOpen className="mb-4 h-10 w-10 text-gray-400" />
        <p className="mb-2 text-center text-lg font-medium">Drag and drop files here</p>
        <p className="mb-4 text-center text-sm text-gray-500">or</p>
        <Button>Browse Files</Button>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="categories">File Categories</TabsTrigger>
          <TabsTrigger value="recent">Recent Files</TabsTrigger>
          <TabsTrigger value="rules">Organization Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fileTypes.map((type) => (
              <Card key={type.id} className="overflow-hidden">
                <div className={`h-1 w-full ${type.color}`} />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${type.color} bg-opacity-20 text-${type.color.split("-")[1]}-600`}
                      >
                        {type.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{type.category}</h3>
                        <p className="text-sm text-gray-500">{type.extension}</p>
                      </div>
                    </div>
                    <Badge>{type.count} files</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recently Organized Files</CardTitle>
              <CardDescription>Files that have been recently organized by the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center space-x-4">
                      {file.name.endsWith(".jpg") || file.name.endsWith(".png") ? (
                        <Image className="h-5 w-5 text-blue-500" />
                      ) : file.name.endsWith(".docx") || file.name.endsWith(".pdf") ? (
                        <FileText className="h-5 w-5 text-amber-500" />
                      ) : file.name.endsWith(".pptx") ? (
                        <FileText className="h-5 w-5 text-red-500" />
                      ) : file.name.endsWith(".xlsx") ? (
                        <FileText className="h-5 w-5 text-green-500" />
                      ) : file.name.endsWith(".mp3") ? (
                        <Music className="h-5 w-5 text-purple-500" />
                      ) : (
                        <File className="h-5 w-5 text-gray-500" />
                      )}
                      <div>
                        <h4 className="font-medium">{file.name}</h4>
                        <p className="text-sm text-gray-500">{file.path}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{file.size}</p>
                      <p>{file.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Organization Rules</CardTitle>
              <CardDescription>Configure how files are organized by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Image className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">Images</h3>
                    </div>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>File extensions: .jpg, .png, .gif, .bmp, .tiff</span>
                      <span>Target folder: Pictures</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-amber-500" />
                      <h3 className="font-medium">Documents</h3>
                    </div>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>File extensions: .doc, .docx, .pdf, .txt, .rtf</span>
                      <span>Target folder: Documents</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Film className="h-5 w-5 text-red-500" />
                      <h3 className="font-medium">Videos</h3>
                    </div>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>File extensions: .mp4, .avi, .mov, .mkv, .wmv</span>
                      <span>Target folder: Videos</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </div>

                <Button className="w-full">Add New Rule</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

