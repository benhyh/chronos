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
  Pencil,
  Circle,
  CircleX,
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
  base_folder_directory: string;
  full_path: string;
  desired_folder_directory: string;
  folder_name: string;
  extensions: string[];
  enabled: boolean;
}

interface MisplacedFile extends FileSystemItem {
  current_folder: string;
  correct_folder: string;
  source_path: string;
  destination_path: string;
  icon?: JSX.Element;
}

interface EnhancedFileSystemItem extends FileSystemItem {
  icon?: JSX.Element;
}

// Helper function to normalize paths
const normalizePath = (path: string): string => {
  return path.replace(/\\/g, '/');
};

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

export default function FileOrganizer() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [folderContents, setFolderContents] = useState<EnhancedFileSystemItem[]>([])
  const [expandedFolders, setExpandedFolders] = useState<string[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [isOrganizing, setIsOrganizing] = useState(false)
  const [organizingProgress, setOrganizingProgress] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [organizationRules, setOrganizationRules] = useState<OrganizationRule[]>([])
  const [showRuleDialog, setShowRuleDialog] = useState(false)
  const [showEditRuleDialog, setShowEditRuleDialog] = useState(false)
  const [newRule, setNewRule] = useState({
    folder_name: "",
    desired_folder_path: "",
    extensions: [] as string[],
  })
  const [misplacedFiles, setMisplacedFiles] = useState<MisplacedFile[]>([]);
  const [editingRule, setEditingRule] = useState<OrganizationRule | null>(null);

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

    // Helper function to check if a file should be in a different folder
    const checkFileLocation = (file: FileSystemItem, currentFolder: string) => {
      if (file.type === "file" && file.extension) {
        const matchingRule = rules.find(r => r.enabled && r.extensions.includes(file.extension))
        if (matchingRule && currentFolder !== matchingRule.folder_name) {
          return {
            ...file,
            current_folder: currentFolder,
            correct_folder: matchingRule.folder_name,
            source_path: file.path || '',
            destination_path: `${matchingRule.full_path}/${file.name}`
          }
        }
      }
      return null
    }

    // Recursive function to scan folders
    const scanFolderRecursively = (folder: FileSystemItem, currentPath: string): MisplacedFile[] => {
      const folderMisplaced: MisplacedFile[] = []

      // Check files in current folder
      if (folder.children) {
        folder.children.forEach(item => {
          if (item.type === "file") {
            const misplacedFile = checkFileLocation(item, folder.name)
            if (misplacedFile) {
              folderMisplaced.push(misplacedFile as MisplacedFile)
            }
          }
        })
      }

      // Recursively check subfolders
      if (folder.children) {
        folder.children.forEach(item => {
          if (item.type === "folder") {
            const subfolderMisplaced = scanFolderRecursively(item, `${currentPath}/${item.name}`)
            folderMisplaced.push(...subfolderMisplaced)
          }
        })
      }

      return folderMisplaced
    }

    // Start scanning from each top-level folder
    contents.forEach(folder => {
      if (folder.type === "folder") {
        const folderMisplaced = scanFolderRecursively(folder, folder.name)
        misplaced.push(...folderMisplaced)
      }
    })

    setMisplacedFiles(misplaced)
  }

  // Function to handle adding a new organization rule
  const handleAddRule = async () => {
    if (!selectedFolder || !newRule.folder_name || newRule.extensions.length === 0) {
      return
    }

    try {
      // Add the organization rule
      const result = await api.add_organization_rule(
        selectedFolder,
        newRule.folder_name,
        newRule.desired_folder_path,
        newRule.extensions,
      )

      if (result) {
        // Update organization rules
        const updatedRules = [...organizationRules, result];
        setOrganizationRules(updatedRules);
        
        // Reset the form and close dialog
        setNewRule({ folder_name: "", desired_folder_path: "", extensions: [] });
        setShowRuleDialog(false);
        
        // Re-check for misplaced files with all rules including the new one
        if (folderContents.length > 0) {
          findMisplacedFiles(folderContents, updatedRules);
        }
        
      } else {
        console.error("Failed to add organization rule.");
      }
    } catch (error) {
      console.error("Error adding organization rule:", error);
    }
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
  const handleOrganizeFiles = async () => {
    
    if (misplacedFiles.length === 0) {
      return
    }

    setIsOrganizing(true)
    setOrganizingProgress(0)

    try {
      const success = await api.organize_files(misplacedFiles);
      if (success) {
        // Don't scan folder immediately - we'll do it after the progress reaches 100%
        setMisplacedFiles([]);
      } else {
        console.error("Failed to organize files.")
      }
    } catch (error) {
      console.log(`There has been an error with organizing the file: ${error}`)
    }

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
          updateFolderStructure()
          setIsOrganizing(false)
          
          // Only re-scan the folder after the organizing process is complete
          if (selectedFolder) {
            scanFolder(selectedFolder);
          }
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
      const currentFolderIndex = newContents.findIndex((f) => f.name === file.current_folder)
      if (currentFolderIndex !== -1) {
        newContents[currentFolderIndex].children = newContents[currentFolderIndex].children?.filter(
          (f) => f.id !== file.id,
        ) || []
      }

      // Add file to correct folder
      const correctFolderIndex = newContents.findIndex((f) => f.name === file.current_folder)
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

  const handleEditRule = (ruleId: string) => {
    const ruleToEdit = organizationRules.find(rule => rule.id === ruleId);
    if (ruleToEdit) {
      setEditingRule(ruleToEdit);
      setNewRule({
        folder_name: ruleToEdit.folder_name,
        desired_folder_path: ruleToEdit.desired_folder_directory,
        extensions: ruleToEdit.extensions,
      })
    }
    setShowEditRuleDialog(true);
    setShowRuleDialog(true);
  }

  const handleUpdateRule = async () => {
    if (!editingRule || !selectedFolder || !newRule.folder_name || newRule.extensions.length === 0) {
      return;
    } 

    try {
      const result = await api.update_organization_rule(
        editingRule.id,
        selectedFolder,
        newRule.folder_name,
        newRule.desired_folder_path,
        newRule.extensions,
      );
    
      if (result) {
        
        const updatedRules = organizationRules.map(rule =>
          rule.id === editingRule.id ? result : rule
        );
        setOrganizationRules(updatedRules);

        setEditingRule(null);
        setNewRule({ folder_name: "", desired_folder_path: "", extensions: []});
        setShowEditRuleDialog(false);
        setShowRuleDialog(false);

        if (folderContents.length > 0) {
          findMisplacedFiles(folderContents, updatedRules)
        }

      } else {
        console.log("We couldn't update the rule. Please try again.")
        return;
      }

    } catch (error) {
      console.error("Error updating organizaiton rule: ", error);
    }
  }

  // Function to render the file tree
  const renderFileTree = (items: EnhancedFileSystemItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.id} className="file-tree-item">
        {item.type === "folder" ? (
          <div>
            <div
              className="flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
              style={{ paddingLeft: `${level * 16 + 8}px` }}
              onClick={() => toggleFolderExpand(item.id)}
            >
              {expandedFolders.includes(item.id) ? (
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
              )}
              <FolderOpen className="h-5 w-5 text-amber-500 mr-2" />
              <span className="text-sm font-medium dark:text-white">{item.name}</span>
              <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                {item.children && item.children.length ? `${item.children.length} ${item.children.length === 1 ? "item" : "items"}` : "0 items"}
              </span>
            </div>
            {expandedFolders.includes(item.id) && item.children && item.children.length > 0 && (
              <div className="folder-children">{renderFileTree(item.children, level + 1)}</div>
            )}
          </div>
        ) : (
          <div
            className={`flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer ${
              misplacedFiles.some((f) => f.id === item.id) ? "bg-red-50 dark:bg-red-900/20" : ""
            }`}
            style={{ paddingLeft: `${level * 16 + 28}px` }}
          >
            {item.icon ? item.icon : <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
            <span className="ml-2 text-sm dark:text-white">{item.name}</span>
            <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">{item.size}</span>
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
          <h2 className="text-2xl font-bold tracking-tight dark:text-white">File Organizer</h2>
          <p className="text-muted-foreground dark:text-gray-400">Organize your files by type and category</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleSelectFolder} className="dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700">
            <FolderOpen className="mr-2 h-4 w-4" />
            Select Folder
          </Button>
          <Button
            onClick={handleOrganizeFiles}
            disabled={!selectedFolder || misplacedFiles.length === 0 || isOrganizing}
            className="dark:bg-white dark:text-black"
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
        <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 border-gray-300 dark:border-gray-700">
          <FolderOpen className="mb-4 h-10 w-10 text-gray-400 dark:text-gray-600" />
          <p className="mb-2 text-center text-lg font-medium dark:text-white">Select a folder to organize</p>
          <p className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">Choose a folder to scan and organize its contents</p>
          <Button onClick={handleSelectFolder} className="dark:bg-white dark:text-black">Select Folder</Button>
        </div>
      ) : isScanning ? (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-8">
              <RefreshCw className="mb-4 h-10 w-10 text-gray-400 dark:text-gray-600 animate-spin" />
              <p className="mb-2 text-center text-lg font-medium dark:text-white">Scanning folder...</p>
              <p className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">This may take a moment</p>
            </div>
          </CardContent>
        </Card>
      ) : folderContents.length === 0 ? (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="mb-4 h-10 w-10 text-gray-400 dark:text-gray-600" />
              <p className="mb-2 text-center text-lg font-medium dark:text-white">No files found</p>
              <p className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">Please select a different folder to scan!</p>
              <Button onClick={handleSelectFolder}>Select Different Folder</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
      <Tabs defaultValue="file-explorer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 dark:bg-gray-800">
          <TabsTrigger value="file-explorer" className="dark:data-[state=active]:bg-gray-700 dark:text-gray-300 dark:data-[state=active]:text-white">File Explorer</TabsTrigger>
          <TabsTrigger value="rules" className="dark:data-[state=active]:bg-gray-700 dark:text-gray-300 dark:data-[state=active]:text-white">Organization Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="file-explorer">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="dark:border-gray-700">
              <div className="flex items-center justify-between">
                  <CardTitle className="dark:text-white">Folder Contents</CardTitle>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => scanFolder(selectedFolder)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
                <CardDescription className="dark:text-gray-400">
                  {selectedFolder ? normalizePath(selectedFolder) : ""}
                  {misplacedFiles.length > 0 && (
                    <Badge variant="outline" className="ml-2 bg-red-50 text-red-600 border border-gray-200/50 dark:bg-red-900/20 dark:text-red-400">
                      {misplacedFiles.length} misplaced files
                    </Badge>
                  )}
                </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-gray-300 dark:border-gray-700">
                  <div className="p-3 max-h-[400px] overflow-y-auto dark:text-white">{renderFileTree(folderContents)}</div>
                </div>

                {misplacedFiles.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3 dark:text-white">Misplaced Files</h3>
                    <div className="rounded-lg border border-gray-300 dark:border-gray-700">
                      <div className="flex items-center justify-between border-b border-gray-300 p-3 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                        <span className="font-medium dark:text-white">File Name</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Current Location</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Should Be In</span>
              </div>
              </div>
                      <div className="max-h-[200px] overflow-y-auto">
                        {misplacedFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between border-b border-gray-300 p-3 bg-red-50 dark:bg-red-900/20 dark:border-gray-700">
                            <div className="flex items-center space-x-2">
                              {file.icon}
                              <span className="text-sm dark:text-white">{file.name}</span>
              </div>
                    <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-500 w-32 text-right dark:text-gray-400">{file.current_folder}</span>
                              <span className="text-sm font-medium w-32 text-right dark:text-white">{file.correct_folder}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {isOrganizing && (
                      <div className="mt-4 flex items-center space-x-4">
                        <span className="text-sm dark:text-white">{organizingProgress}% complete</span>
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
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="dark:border-gray-700">
                <div className="flex items-center justify-between">
              <CardTitle className="dark:text-white">Organization Rules</CardTitle>
                  <Button onClick={() => setShowRuleDialog(true)} className="dark:bg-white dark:text-black">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Rule
                  </Button>
                </div>
                <CardDescription className="dark:text-gray-400">Define which file types belong in which folders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                  {organizationRules.map((rule) => (
                    <div key={rule.id} className="rounded-lg border border-gray-300 p-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                          <FolderOpen className="h-5 w-5 text-amber-500" />
                          <h3 className="font-medium dark:text-white">{rule.folder_name}</h3>
                          <h4 className="text-gray-500 text-sm mt-0. dark:text-gray-400">{normalizePath(rule.full_path)}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className={rule.enabled ? "bg-green-50 text-green-600 border border-gray-200/50 dark:bg-green-900/20 dark:text-green-400" : "bg-red-50 text-red-600 border border-gray-200/50 dark:bg-red-900/20 dark:text-red-400"}
                          >
                            {rule.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 dark:text-gray-400 dark:hover:bg-gray-700">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                              <DropdownMenuItem onClick={() => handleEditRule(rule.id)} className="dark:text-white dark:focus:bg-gray-700">
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleRuleEnabled(rule.id)} className="dark:text-white dark:focus:bg-gray-700">
                                {rule.enabled ? <><Circle className="mr-2 h-4 w-4" />Disable</> : <><CircleX className="mr-2 h-4 w-4" />Enable</>}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deleteRule(rule.id)} className="dark:text-white dark:focus:bg-gray-700">
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
                            <Badge key={index} variant="secondary" className="dark:bg-gray-700 dark:text-gray-200">
                              {ext}
                            </Badge>
                          ))}
                  </div>
                </div>
                    </div>
                  ))}

                  {organizationRules.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 border rounded-lg border-dashed dark:border-gray-700">
                      <AlertCircle className="mb-4 h-10 w-10 text-gray-400 dark:text-gray-600" />
                      <p className="mb-2 text-center text-lg font-medium dark:text-white">No rules defined</p>
                      <p className="mb-4 text-center text-sm text-gray-500 dark:text-gray-400">Add rules to organize your files</p>
                      <Button className="dark:bg-white dark:text-black" onClick={() => setShowRuleDialog(true)}>Add Rule</Button>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}

      <Dialog open={showRuleDialog} onOpenChange={(open) => {
        setShowRuleDialog(open);
        if (!open) {
          setShowEditRuleDialog(false);
          setNewRule({ folder_name: "", desired_folder_path: "", extensions: [] })
        }
      }}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            {showEditRuleDialog == true ? (
              <DialogTitle className="dark:text-white">Edit Organization Rule</DialogTitle>
            ) : (
              <DialogTitle className="dark:text-white">Add Organization Rule</DialogTitle>
            )}
            <DialogDescription className="dark:text-gray-400">Define which file types belong in which folder</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-name" className="dark:text-gray-300">Folder Name</Label>
              <Input
                id="folder-name"
                placeholder="Enter folder name"
                value={newRule.folder_name}
                onChange={(e) => setNewRule({ ...newRule, folder_name: e.target.value })}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="file-types" className="dark:text-gray-300">File Types</Label>
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
                <SelectTrigger id="file-types" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select file type category" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  {fileTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()} className="dark:text-white dark:focus:bg-gray-700">
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
                <Label className="dark:text-gray-300">Selected Extensions</Label>
                <div className="flex flex-wrap gap-2 p-2 rounded-md dark:bg-background dark:border-gray-600">
                  {newRule.extensions.map((ext, index) => (
                    <Badge key={index} variant="secondary" className="dark:bg-gray-600 dark:text-gray-200">
                      {ext}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRuleDialog(false)} className="dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600">
              Cancel
            </Button>
            {showEditRuleDialog == true ? (
              <Button className="dark:bg-white dark:text-black" onClick={handleUpdateRule} disabled={!newRule.folder_name || newRule.extensions.length === 0}>
                Edit Rule
              </Button>
            ) : (
              <Button className="dark:bg-white dark:text-black" onClick={handleAddRule} disabled={!newRule.folder_name || newRule.extensions.length === 0}>
                Add Rule
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
