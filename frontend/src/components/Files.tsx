"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FolderOpen,
  FileText,
  Image,
  Film,
  Music,
  Archive,
  Code,
  Trash2,
  MoreVertical,
  RefreshCw,
  Search,
  ChevronRight,
  ChevronDown,
  Plus,
  AlertCircle,
} from "lucide-react"
import { api, FileSystemItem } from "../lib/api"

// Define types for our component
interface FileTypeInfo {
  id: number;
  extension: string[];
  category: string;
  icon: JSX.Element;
  color: string;
}

interface OrganizationRule {
  id: string;
  folderName: string;
  extensions: string[];
  enabled: boolean;
}

interface MisplacedFile extends FileSystemItem {
  currentFolder: string;
  correctFolder: string;
  icon?: JSX.Element;
}

interface EnhancedFileSystemItem extends FileSystemItem {
  icon?: JSX.Element;
}

// Mock data for file types
const fileTypes: FileTypeInfo[] = [
  {
    id: 1,
    extension: [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff"],
    category: "Images",
    icon: <Image className="h-5 w-5" />,
    color: "bg-blue-500",
  },
  {
    id: 2,
    extension: [".doc", ".docx", ".pdf", ".txt", ".rtf", ".odt"],
    category: "Documents",
    icon: <FileText className="h-5 w-5" />,
    color: "bg-amber-500",
  },
  {
    id: 3,
    extension: [".mp4", ".avi", ".mov", ".mkv", ".wmv", ".flv"],
    category: "Videos",
    icon: <Film className="h-5 w-5" />,
    color: "bg-red-500",
  },
  {
    id: 4,
    extension: [".mp3", ".wav", ".flac", ".aac", ".ogg", ".wma"],
    category: "Audio",
    icon: <Music className="h-5 w-5" />,
    color: "bg-green-500",
  },
  {
    id: 5,
    extension: [".zip", ".rar", ".7z", ".tar", ".gz", ".bz2"],
    category: "Archives",
    icon: <Archive className="h-5 w-5" />,
    color: "bg-purple-500",
  },
  {
    id: 6,
    extension: [".js", ".py", ".html", ".css", ".java", ".cpp", ".php"],
    category: "Code",
    icon: <Code className="h-5 w-5" />,
    color: "bg-gray-500",
  },
]

// Initial organization rules
const initialRules: OrganizationRule[] = [
  {
    id: "rule-1",
    folderName: "Images",
    extensions: [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff"],
    enabled: true,
  },
  {
    id: "rule-2",
    folderName: "Documents",
    extensions: [".doc", ".docx", ".pdf", ".txt", ".rtf", ".odt"],
    enabled: true,
  },
  {
    id: "rule-3",
    folderName: "Videos",
    extensions: [".mp4", ".avi", ".mov", ".mkv", ".wmv", ".flv"],
    enabled: true,
  },
]

export default function FileOrganizer() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [folderContents, setFolderContents] = useState<EnhancedFileSystemItem[]>([])
  const [expandedFolders, setExpandedFolders] = useState<string[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [isOrganizing, setIsOrganizing] = useState(false)
  const [organizingProgress, setOrganizingProgress] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [organizationRules, setOrganizationRules] = useState<OrganizationRule[]>(initialRules)
  const [showRuleDialog, setShowRuleDialog] = useState(false)
  const [newRule, setNewRule] = useState({
    folderName: "",
    extensions: [] as string[],
  })
  const [misplacedFiles, setMisplacedFiles] = useState<MisplacedFile[]>([])

  const handleSelectFolder = async () => {
    try {
      const folderPath = await api.select_folder();
      
      if (folderPath) {
        setSelectedFolder(folderPath);

        scanFolder(folderPath);
      }
    } catch (error) {
      console.error("Error selecting folder:", error);
      alert("Error selecting folder. See console for details.");
    }
  }

  // Update the scanFolder function to add icons to files
  const scanFolder = async (folderPath: string) => {
    setIsScanning(true);
    
    try {
      // Get folder contents from API (Python backend or mock)
      const contents = await api.scan_folder(folderPath);
      
      if (contents && Array.isArray(contents)) {
        // Add icons to files based on their extension
        const contentsWithIcons = addIconsToFileItems(contents);
        setFolderContents(contentsWithIcons);
        // Find misplaced files based on organization rules
        findMisplacedFiles(contentsWithIcons, organizationRules);
      } else {
        console.warn("Received invalid folder contents", contents);
        // If we get invalid data, use an empty array
        setFolderContents([]);
      }
    } catch (error) {
      console.error("Error scanning folder:", error);
    } finally {
      setIsScanning(false);
    }
  }

  // Helper function to add icons to files recursively
  const addIconsToFileItems = (items: FileSystemItem[]): EnhancedFileSystemItem[] => {
    return items.map(item => {
      if (item.type === "folder" && item.children) {
        // Recursively process children for folders
        return {
          ...item,
          children: addIconsToFileItems(item.children)
        };
      } else if (item.type === "file") {
        // Add icon based on file extension
        const fileType = getFileTypeByExtension(item.extension || "");
        return {
          ...item,
          icon: fileType ? fileType.icon : <FileText className="h-4 w-4 text-gray-500" />
        };
      }
      return item as EnhancedFileSystemItem;
    });
  }

  // Helper function to get file type by extension
  const getFileTypeByExtension = (extension: string): FileTypeInfo | undefined => {
    if (!extension) return undefined;
    
    return fileTypes.find(type => 
      type.extension.includes(extension.toLowerCase())
    );
  }

  // Function to find misplaced files based on organization rules
  const findMisplacedFiles = (contents: FileSystemItem[], rules: OrganizationRule[]): void => {
    const misplaced: MisplacedFile[] = []

    // Check each folder
    contents.forEach((folder) => {
      if (folder.type === "folder" && folder.children) {
        // Find the rule for this folder
        const rule = rules.find((r) => r.folderName === folder.name && r.enabled)

        if (rule) {
          // Check each file in the folder
          folder.children.forEach((file) => {
            if (file.type === "file") {
              // If the file extension is not allowed in this folder according to the rule
              if (file.extension && !rule.extensions.includes(file.extension)) {
                misplaced.push({
                  ...file,
                  currentFolder: folder.name,
                  correctFolder: findCorrectFolder(file.extension, rules),
                })
              }
            }
          })
        }
      }
    })

    setMisplacedFiles(misplaced)
  }

  // Function to find the correct folder for a file based on its extension
  const findCorrectFolder = (extension: string | undefined, rules: OrganizationRule[]): string => {
    if (!extension) return "Unknown";
    
    for (const rule of rules) {
      if (rule.enabled && rule.extensions.includes(extension)) {
        return rule.folderName
      }
    }
    return "Unknown"
  }

  // Function to toggle folder expansion
  const toggleFolderExpand = (folderId: string) => {
    setExpandedFolders((prev) => {
      if (prev.includes(folderId)) {
        return prev.filter((id) => id !== folderId)
      } else {
        return [...prev, folderId]
      }
    })
  }

  // Function to handle organizing files
  const handleOrganizeFiles = () => {
    if (misplacedFiles.length === 0) {
      return
    }

    setIsOrganizing(true)
    setOrganizingProgress(0)

    // Simulate organizing process
    const totalFiles = misplacedFiles.length
    let processed = 0

    const interval = setInterval(() => {
      processed++
      const progress = Math.round((processed / totalFiles) * 100)
      setOrganizingProgress(progress)

      if (processed >= totalFiles) {
        clearInterval(interval)
        setTimeout(() => {
          // After organizing, update the folder structure
          // This would be where your Python backend would actually move the files
          updateFolderStructure()
          setIsOrganizing(false)
          setMisplacedFiles([])
        }, 1000)
      }
    }, 500)
  }

  // Function to update folder structure after organizing
  const updateFolderStructure = () => {
    // This function would update the folder structure after organizing
    // In a real implementation, this would reflect the actual file system changes
    // made by your Python backend

    // For this mock, we'll just move the misplaced files to their correct folders
    const newContents = [...folderContents]

    misplacedFiles.forEach((file) => {
      // Remove file from current folder
      const currentFolderIndex = newContents.findIndex((f) => f.name === file.currentFolder)
      if (currentFolderIndex !== -1) {
        newContents[currentFolderIndex].children = newContents[currentFolderIndex].children?.filter(
          (f) => f.id !== file.id,
        ) || []
      }

      // Add file to correct folder
      const correctFolderIndex = newContents.findIndex((f) => f.name === file.correctFolder)
      if (correctFolderIndex !== -1) {
        if (!newContents[correctFolderIndex].children) {
          newContents[correctFolderIndex].children = []
        }
        newContents[correctFolderIndex].children?.push({
          ...file,
          id: `${file.id}-moved`,
        })
      }
    })

    setFolderContents(newContents)
  }

  // Function to handle adding a new organization rule
  const handleAddRule = () => {
    if (!newRule.folderName || newRule.extensions.length === 0) {
      return
    }

    const rule = {
      id: `rule-${Date.now()}`,
      folderName: newRule.folderName,
      extensions: newRule.extensions,
      enabled: true,
    }

    setOrganizationRules([...organizationRules, rule])
    setNewRule({ folderName: "", extensions: [] })
    setShowRuleDialog(false)

    // Re-check for misplaced files with the new rule
    if (folderContents.length > 0) {
      findMisplacedFiles(folderContents, [...organizationRules, rule])
    }
  }

  // Function to toggle a rule's enabled state
  const toggleRuleEnabled = (ruleId: string) => {
    const updatedRules = organizationRules.map((rule) => {
      if (rule.id === ruleId) {
        return { ...rule, enabled: !rule.enabled }
      }
      return rule
    })

    setOrganizationRules(updatedRules)

    // Re-check for misplaced files with the updated rules
    if (folderContents.length > 0) {
      findMisplacedFiles(folderContents, updatedRules)
    }
  }

  // Function to delete a rule
  const deleteRule = (ruleId: string) => {
    const updatedRules = organizationRules.filter((rule) => rule.id !== ruleId)
    setOrganizationRules(updatedRules)

    // Re-check for misplaced files with the updated rules
    if (folderContents.length > 0) {
      findMisplacedFiles(folderContents, updatedRules)
    }
  }

  // Function to render the file tree
  const renderFileTree = (items: EnhancedFileSystemItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.id} className="file-tree-item">
        {item.type === "folder" ? (
          <div>
            <div
              className="flex items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer"
              style={{ paddingLeft: `${level * 16 + 8}px` }}
              onClick={() => toggleFolderExpand(item.id)}
            >
              {expandedFolders.includes(item.id) ? (
                <ChevronDown className="h-4 w-4 text-gray-500 mr-1" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500 mr-1" />
              )}
              <FolderOpen className="h-5 w-5 text-amber-500 mr-2" />
              <span className="text-sm font-medium">{item.name}</span>
              <span className="ml-auto text-xs text-gray-500">
                {item.children && item.children.length ? `${item.children.length} ${item.children.length === 1 ? "item" : "items"}` : "0 items"}
              </span>
            </div>
            {expandedFolders.includes(item.id) && item.children && item.children.length > 0 && (
              <div className="folder-children">{renderFileTree(item.children, level + 1)}</div>
            )}
          </div>
        ) : (
          <div
            className={`flex items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer ${
              misplacedFiles.some((f) => f.id === item.id) ? "bg-red-50" : ""
            }`}
            style={{ paddingLeft: `${level * 16 + 28}px` }}
          >
            {item.icon ? item.icon : <FileText className="h-4 w-4 text-gray-500" />}
            <span className="ml-2 text-sm">{item.name}</span>
            <span className="ml-auto text-xs text-gray-500">{item.size}</span>
          </div>
        )}
      </div>
    ))
  }

  // Effect to expand all folders initially when folder contents change
  useEffect(() => {
    if (folderContents.length > 0) {
      setExpandedFolders(folderContents.map((folder) => folder.id))
    }
  }, [folderContents])

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">File Organizer</h2>
          <p className="text-muted-foreground">Organize your files by type and category</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleSelectFolder}>
            <FolderOpen className="mr-2 h-4 w-4" />
            Select Folder
          </Button>
          <Button
            onClick={handleOrganizeFiles}
            disabled={!selectedFolder || misplacedFiles.length === 0 || isOrganizing}
          >
            {isOrganizing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Organizing...
              </>
            ) : (
              "Organize Files"
            )}
          </Button>
        </div>
      </div>

      {!selectedFolder ? (
        <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 border-gray-300">
          <FolderOpen className="mb-4 h-10 w-10 text-gray-400" />
          <p className="mb-2 text-center text-lg font-medium">Select a folder to organize</p>
          <p className="mb-4 text-center text-sm text-gray-500">Choose a folder to scan and organize its contents</p>
          <Button onClick={handleSelectFolder}>Select Folder</Button>
        </div>
      ) : isScanning ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-8">
              <RefreshCw className="mb-4 h-10 w-10 text-gray-400 animate-spin" />
              <p className="mb-2 text-center text-lg font-medium">Scanning folder...</p>
              <p className="mb-4 text-center text-sm text-gray-500">This may take a moment</p>
            </div>
          </CardContent>
        </Card>
      ) : (
      <Tabs defaultValue="file-explorer" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file-explorer">File Explorer</TabsTrigger>
          <TabsTrigger value="rules">Organization Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="file-explorer">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                  <CardTitle>Folder Contents</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search files..."
                      className="pl-8 pb-3 w-[200px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                    <Button variant="outline" size="sm" onClick={() => scanFolder(selectedFolder)}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
                <CardDescription>
                  {selectedFolder}
                  {misplacedFiles.length > 0 && (
                    <Badge variant="outline" className="ml-2 bg-red-50 text-red-600 border border-gray-200/50">
                      {misplacedFiles.length} misplaced files
                    </Badge>
                  )}
                </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-gray-300">
                  <div className="p-3 max-h-[400px] overflow-y-auto">{renderFileTree(folderContents)}</div>
                </div>

                {misplacedFiles.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Misplaced Files</h3>
                    <div className="rounded-lg border border-gray-300">
                      <div className="flex items-center justify-between border-b border-gray-300 p-3 bg-gray-50">
                        <span className="font-medium">File Name</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">Current Location</span>
                          <span className="text-sm text-gray-500">Should Be In</span>
              </div>
              </div>
                      <div className="max-h-[200px] overflow-y-auto">
                        {misplacedFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between border-b border-gray-300 p-3 bg-red-50">
                            <div className="flex items-center space-x-2">
                              {file.icon}
                              <span className="text-sm">{file.name}</span>
              </div>
                    <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-500 w-32 text-right">{file.currentFolder}</span>
                              <span className="text-sm font-medium w-32 text-right">{file.correctFolder}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {isOrganizing && (
                      <div className="mt-4 flex items-center space-x-4">
                        <span className="text-sm">{organizingProgress}% complete</span>
                        <Progress value={organizingProgress} className="flex-1 h-2" />
                      </div>
                    )}

                    <div className="mt-4 flex justify-end">
                      <Button onClick={handleOrganizeFiles} disabled={isOrganizing}>
                        {isOrganizing ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Organizing...
                          </>
                        ) : (
                          "Organize Files"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
                </CardContent>
              </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
              <CardTitle>Organization Rules</CardTitle>
                  <Button onClick={() => setShowRuleDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Rule
                  </Button>
                </div>
                <CardDescription>Define which file types belong in which folders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                  {organizationRules.map((rule) => (
                    <div key={rule.id} className="rounded-lg border border-gray-300 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                          <FolderOpen className="h-5 w-5 text-amber-500" />
                          <h3 className="font-medium">{rule.folderName}</h3>
                    </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className={rule.enabled ? "bg-green-50 text-green-600 border border-gray-200/50" : "bg-red-50 text-red-600 border border-gray-200/50"}
                          >
                            {rule.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toggleRuleEnabled(rule.id)}>
                                {rule.enabled ? "Disable" : "Enable"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deleteRule(rule.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                  </div>
                  <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {rule.extensions.map((ext, index) => (
                            <Badge key={index} variant="secondary">
                              {ext}
                            </Badge>
                          ))}
                  </div>
                </div>
                    </div>
                  ))}

                  {organizationRules.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 border rounded-lg border-dashed">
                      <AlertCircle className="mb-4 h-10 w-10 text-gray-400" />
                      <p className="mb-2 text-center text-lg font-medium">No rules defined</p>
                      <p className="mb-4 text-center text-sm text-gray-500">Add rules to organize your files</p>
                      <Button onClick={() => setShowRuleDialog(true)}>Add Rule</Button>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}

      <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Organization Rule</DialogTitle>
            <DialogDescription>Define which file types belong in which folder</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                placeholder="e.g. Images, Documents, Videos"
                value={newRule.folderName}
                onChange={(e) => setNewRule({ ...newRule, folderName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file-types">File Types</Label>
              <Select
                onValueChange={(value) => {
                  const fileType = fileTypes.find((type) => type.id.toString() === value)
                  if (fileType) {
                    setNewRule({
                      ...newRule,
                      extensions: fileType.extension,
                    })
                  }
                }}
              >
                <SelectTrigger id="file-types">
                  <SelectValue placeholder="Select file type category" />
                </SelectTrigger>
                <SelectContent>
                  {fileTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      <div className="flex items-center">
                        {type.icon}
                        <span className="ml-2">{type.category}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newRule.extensions.length > 0 && (
              <div className="grid gap-2">
                <Label>Selected Extensions</Label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                  {newRule.extensions.map((ext, index) => (
                    <Badge key={index} variant="secondary">
                      {ext}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRuleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRule} disabled={!newRule.folderName || newRule.extensions.length === 0}>
              Add Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

