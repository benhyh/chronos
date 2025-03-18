"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Database, Save, FileJson, Bell, Moon, Sun } from "lucide-react"

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Configure application preferences and storage options</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Appearance</h3>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-4">
                    {darkMode ? <Moon className="h-5 w-5 text-blue-500" /> : <Sun className="h-5 w-5 text-amber-500" />}
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-gray-500">Toggle between light and dark themes</p>
                    </div>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Startup</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="startup" defaultChecked />
                    <Label htmlFor="startup">Launch on system startup</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="minimize" defaultChecked />
                    <Label htmlFor="minimize">Start minimized to system tray</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Default Folders</h3>
                <div className="grid gap-2">
                  <Label htmlFor="downloads">Downloads Folder</Label>
                  <div className="flex space-x-2">
                    <Input id="downloads" defaultValue="C:/Users/User/Downloads" className="flex-1" />
                    <Button variant="outline">Browse...</Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="documents">Documents Folder</Label>
                  <div className="flex space-x-2">
                    <Input id="documents" defaultValue="C:/Users/User/Documents" className="flex-1" />
                    <Button variant="outline">Browse...</Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>Storage Settings</CardTitle>
              <CardDescription>Configure how task data is stored</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Storage Type</h3>
                <div className="grid gap-4">
                  <div className="flex items-center space-x-4 rounded-lg border p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <FileJson className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">JSON Files</h4>
                          <p className="text-sm text-gray-500">Store data in JSON files</p>
                        </div>
                        <Switch id="json-storage" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 rounded-lg border p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <Database className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">SQLite Database</h4>
                          <p className="text-sm text-gray-500">Store data in a SQLite database</p>
                        </div>
                        <Switch id="sqlite-storage" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Location</h3>
                <div className="grid gap-2">
                  <Label htmlFor="data-path">Data Storage Path</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="data-path"
                      defaultValue="C:/Users/User/AppData/Local/TaskAutomation"
                      className="flex-1"
                    />
                    <Button variant="outline">Browse...</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Backup Settings</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-backup" defaultChecked />
                    <Label htmlFor="auto-backup">Enable automatic backups</Label>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="backup-frequency">Backup Frequency</Label>
                    <Select defaultValue="weekly">
                      <SelectTrigger id="backup-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="backup-path">Backup Location</Label>
                    <div className="flex space-x-2">
                      <Input id="backup-path" defaultValue="C:/Users/User/Documents/Backups" className="flex-1" />
                      <Button variant="outline">Browse...</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="flex items-center gap-1">
                <Save className="h-4 w-4" />
                <span>Backup Now</span>
              </Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Types</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center space-x-4">
                      <Bell className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Task Completion</p>
                        <p className="text-sm text-gray-500">Notify when tasks are completed</p>
                      </div>
                    </div>
                    <Switch id="task-completion" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center space-x-4">
                      <Bell className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="font-medium">Task Failures</p>
                        <p className="text-sm text-gray-500">Notify when tasks fail to complete</p>
                      </div>
                    </div>
                    <Switch id="task-failures" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center space-x-4">
                      <Bell className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">File Organization</p>
                        <p className="text-sm text-gray-500">Notify when files are organized</p>
                      </div>
                    </div>
                    <Switch id="file-organization" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Display</h3>
                <div className="grid gap-2">
                  <Label htmlFor="notification-duration">Notification Duration (seconds)</Label>
                  <Input id="notification-duration" type="number" defaultValue="5" min="1" max="30" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="sound-notifications" defaultChecked />
                    <Label htmlFor="sound-notifications">Enable sound notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="minimize-notifications" defaultChecked />
                    <Label htmlFor="minimize-notifications">Show notifications when minimized</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure advanced application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Performance</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="background-processing" defaultChecked />
                    <Label htmlFor="background-processing">Enable background processing</Label>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="max-threads">Maximum Threads</Label>
                    <Select defaultValue="4">
                      <SelectTrigger id="max-threads">
                        <SelectValue placeholder="Select threads" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 Threads</SelectItem>
                        <SelectItem value="4">4 Threads</SelectItem>
                        <SelectItem value="8">8 Threads</SelectItem>
                        <SelectItem value="16">16 Threads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Logging</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="enable-logging" defaultChecked />
                    <Label htmlFor="enable-logging">Enable application logging</Label>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="log-level">Log Level</Label>
                    <Select defaultValue="info">
                      <SelectTrigger id="log-level">
                        <SelectValue placeholder="Select log level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="debug">Debug</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="log-path">Log File Location</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="log-path"
                        defaultValue="C:/Users/User/AppData/Local/TaskAutomation/logs"
                        className="flex-1"
                      />
                      <Button variant="outline">Browse...</Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">System Integration</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="context-menu" defaultChecked />
                    <Label htmlFor="context-menu">Add to Windows context menu</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="file-associations" />
                    <Label htmlFor="file-associations">Register file associations</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Reset Application</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full text-red-500 hover:bg-red-50 hover:text-red-600">
                    Reset to Default Settings
                  </Button>
                  <Button variant="outline" className="w-full text-red-500 hover:bg-red-50 hover:text-red-600">
                    Clear All Data
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

