import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { 
  CheckCircle, 
  FolderOpen, 
  AlertCircle, 
  FileText, 
  BarChart2, 
  Clock, 
  Lightbulb 
} from "lucide-react"
import { Button } from './ui/button';
import { useEffect, useState } from "react";
import { Activity, api, DashboardStats } from "@/lib/api";

// Tips to show when there's empty space
const taskTips = [
  "Break large tasks into smaller, manageable subtasks",
  "Set realistic deadlines for your tasks",
  "Prioritize tasks based on urgency and importance",
  "Review completed tasks to improve your workflow",
  "Use labels or tags to categorize similar tasks",
]

const organizationTips = [
  "Organize files by project or category for easier access",
  "Use consistent naming conventions for your files",
  "Regularly clean up temporary files to save space",
  "Back up important files to prevent data loss",
  "Use search filters to quickly find specific files",
]

// Get random tips
const getRandomTip = (tips: string[]) => {
  return tips[Math.floor(Math.random() * tips.length)]
}

const Dashboard = ({ setActiveTab } : { setActiveTab: (tab: string) => void }) => {
  const [statistics, setStatistics] = useState<DashboardStats>({
    tasks_completed: 0,
    files_organized: 0,
    pending_tasks: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [latestTasks, setLatestTasks] = useState<Activity[]>([]);

  useEffect(() => {
    fetchStatistics();
    fetchActivities();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const result = await api.getDashboardStats();
      setStatistics(result);
      setError(null);
    } catch (error) {
      console.log(`There has been an error with fetching the dashboard statistics: ${error}`);
      setError("Failed to fetch dashboard stats. Check console for further information.");
    } finally {
      setLoading(false);
    }
  }

  const fetchActivities = async() => {
    try {
      const activities = await api.get_recent_activities();
      const tasks = await api.get_latest_tasks();
      setRecentActivities(activities);
      setLatestTasks(tasks);
    } catch (error) {
      console.error('Error fetching dashboard activities and tasks', error);
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8 dark:text-white">Loading dashboard stats...</div>;
  }

  if (error) {
    return <div className="flex justify-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<CheckCircle className="h-8 w-8 text-green-500" />}
          title="Tasks Completed"
          value={statistics.tasks_completed.toString()}
          description="lifetime"
        />
        <StatCard
          icon={<FolderOpen className="h-8 w-8 text-amber-500" />}
          title="Files Organized"
          value={statistics.files_organized.toString()}
          description="lifetime"
        />
        <StatCard
          icon={<AlertCircle className="h-8 w-8 text-red-500" />}
          title="Pending Tasks"
          value={statistics.pending_tasks.toString()}
          description="get working boy"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="dark:text-white">Recent Activity</CardTitle>
                <CardDescription className="dark:text-gray-400">Your latest activities</CardDescription>
              </div>
            </div>
          </CardHeader>
          {recentActivities.length === 0 ? (
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium dark:text-white">No recent activity</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                  Your recent activities will appear here once you start using the application.
                </p>
                <div className="mt-6 flex gap-2">
                  <Button onClick={() => setActiveTab("tasks")} variant="outline" size="sm" className="dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:border-gray-600">
                    Create a Task
                  </Button>
                  <Button onClick={() => setActiveTab("files")} variant="outline" size="sm" className="dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:border-gray-600">
                    Organize Files
                  </Button>
                </div>
              </div>
            </CardContent>
          ) : (
            <CardContent>
              <div className="space-y-4">
                {/* Activity items */}
                {recentActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}

                {/* Tip card to fill space when there's only one item */}
                {recentActivities.length < 3 && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">Pro Tip</h4>
                        <p className="text-xs text-blue-600 dark:text-blue-200 mt-1">{getRandomTip(taskTips)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="dark:text-white">Task Progress</CardTitle>
                <CardDescription className="dark:text-gray-400">Current status of your tasks</CardDescription>
              </div>
            </div>
          </CardHeader>
          {latestTasks.length === 0 ? (
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BarChart2 className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium dark:text-white">No tasks in progress</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-md">
                  Create tasks to track your progress and see them here.
                </p>
                <Button onClick={() => setActiveTab("tasks")} className="mt-6 dark:bg-white dark:text-black" size="sm">
                  Create a Task
                </Button>
              </div>
            </CardContent>
          ) : (
            <CardContent>
              <div className="space-y-4">
                {/* Task items */}
                {latestTasks.map((task) => (
                  <TaskStatusItem key={task.id} task={task} />
                ))}

                {/* Organization tip when there are few tasks */}
                {latestTasks.length < 3 && (
                  <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-700 dark:text-amber-300">Organization Tip</h4>
                        <p className="text-xs text-amber-600 dark:text-amber-200 mt-1">
                          {getRandomTip(organizationTips)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

function StatCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode
  title: string
  value: string
  description?: string
}) {
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold dark:text-white">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
            )}
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ activity }: { activity: Activity }) {
  // Format the timestamp
  const formatDate = (timestamp: string) => {
    if (!timestamp) return '';
    
    // For timestamps that include time, we want to preserve the local time
    // but avoid any date shifting due to timezone
    const date = new Date(timestamp);
    
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  }

  // Get icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task_created":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case "task_completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "task_started":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "tasks":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case "organization":
        return <FolderOpen className="h-4 w-4 text-purple-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(activity.timestamp)}</p>
      </div>
    </div>
  )
}

function TaskStatusItem({ task }: { task: Activity }) {
  const [animationFrame, setAnimationFrame] = useState(0)

  // Create pulsing animation for in-progress tasks
  useEffect(() => {
    let animationId: number

    if (task.status === "In Progress") {
      const animate = () => {
        setAnimationFrame((prev) => (prev + 0.5) % 60)
        animationId = requestAnimationFrame(animate)
      }

      animationId = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(animationId)
    }
  }, [task.status])

  // Get status indicator based on task status
  const getStatusIndicator = () => {
    switch (task.status) {
      case "Completed":
        return (
          <div className="relative flex items-center justify-center w-5 h-5">
            <div className="absolute w-5 h-5 rounded-full bg-green-500 opacity-20"></div>
            <div className="absolute w-4 h-4 rounded-full bg-green-500 opacity-40"></div>
            <div className="absolute w-3 h-3 rounded-full bg-green-500 opacity-60"></div>
            <div className="absolute w-2 h-2 rounded-full bg-green-500 opacity-80"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.9)]"></div>
          </div>
        )
      case "In Progress":
        return (
          <div className="relative flex items-center justify-center w-5 h-5">
            {/* Radar-like ripple effect */}
            <div
              className="absolute w-5 h-5 rounded-full bg-blue-500 opacity-10 transform scale-100"
              style={{
                transform: `scale(${1 + (animationFrame % 40) / 40})`,
                opacity: 0.2 - ((animationFrame % 40) / 40) * 0.2,
              }}
            ></div>
            <div
              className="absolute w-5 h-5 rounded-full bg-blue-500 opacity-20 transform scale-100"
              style={{
                transform: `scale(${1 + ((animationFrame + 20) % 40) / 40})`,
                opacity: 0.3 - (((animationFrame + 20) % 40) / 40) * 0.3,
              }}
            ></div>
            <div className="absolute w-3 h-3 rounded-full bg-blue-500 opacity-40"></div>
            <div className="absolute w-2 h-2 rounded-full bg-blue-500 opacity-60"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.9)]"></div>
          </div>
        )
      default:
        return (
          <div className="relative flex items-center justify-center w-5 h-5">
            <div className="absolute w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 opacity-30"></div>
            <div className="absolute w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 opacity-40"></div>
            <div className="absolute w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 opacity-60"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"></div>
          </div>
        )
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    // Handle timezone issue by parsing the date in UTC
    // First split the date string in case it has time information
    const datePart = dateString.split('T')[0].split(' ')[0];
    // Parse the date parts to create a UTC date
    const [year, month, day] = datePart.split('-').map(num => parseInt(num, 10));
    const date = new Date(Date.UTC(year, month - 1, day));
    
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC" // Force UTC to avoid timezone shifts
    }).format(date);
  }

  // Display either due date or creation timestamp
  const getDateDisplay = () => {
    if (task.due_date) {
      return `Due ${formatDate(task.due_date)}`;
    } else {
      return `Created ${formatDate(task.timestamp)}`;
    }
  }

  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <div>{getStatusIndicator()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
          {task.status} • {getDateDisplay()}
        </p>
      </div>
    </div>
  )
}

export default Dashboard
