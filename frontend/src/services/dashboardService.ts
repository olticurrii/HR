import { api } from './authService';
import { taskService, Task } from './taskService';
import { projectService, Project } from './projectService';
import { userService, User } from './userService';
import { notificationService, Notification } from './notificationService';
import { timeTrackingService, ActiveUser } from './timeTrackingService';
import { performanceService, MonthlyReport } from './performanceService';

// Dashboard-specific interfaces
export interface DashboardStats {
  totalTasks: number;
  tasksTrend: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  activeProjects: number;
  projectsTrend: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  teamMembers: number;
  membersTrend: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  unreadMessages: number;
  messagesTrend: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
}

export interface DashboardActivity {
  id: string;
  type: 'task' | 'project' | 'meeting' | 'message' | 'document' | 'leave' | 'performance';
  title: string;
  description?: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
  status?: 'completed' | 'in_progress' | 'pending' | 'overdue';
}

export interface TeamStatusOverview {
  activeUsers: ActiveUser[];
  totalActive: number;
  totalUsers: number;
  averageHoursToday: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivities: DashboardActivity[];
  teamStatus?: TeamStatusOverview;
  monthlyReport?: MonthlyReport;
}

export const dashboardService = {
  /**
   * Get quick stats only (for faster initial load)
   */
  getQuickStats: async (): Promise<DashboardStats> => {
    const [tasks, projects, users, unreadCount] = await Promise.all([
      taskService.getAllTasks(),
      projectService.getAllProjects(), 
      userService.getAllUsers(),
      notificationService.getUnreadCount()
    ]);

    return calculateDashboardStats(tasks, projects, users, unreadCount);
  },

  /**
   * Get recent activities only
   */
  getRecentActivities: async (limit: number = 8): Promise<DashboardActivity[]> => {
    const [tasks, projects, notifications] = await Promise.all([
      taskService.getAllTasks(),
      projectService.getAllProjects(),
      notificationService.getNotifications(limit)
    ]);

    return transformToActivities(tasks, projects, notifications, limit);
  },

  /**
   * Get team status (admin/manager only)
   */
  getTeamStatus: async (): Promise<TeamStatusOverview | null> => {
    try {
      const [activeUsers, users] = await Promise.all([
        timeTrackingService.getActiveUsers(),
        userService.getAllUsers()
      ]);

      return {
        activeUsers: activeUsers,
        totalActive: activeUsers.length,
        totalUsers: users.length,
        averageHoursToday: activeUsers.reduce((acc, user) => 
          acc + (user.current_duration_minutes / 60), 0) / Math.max(activeUsers.length, 1)
      };
    } catch (error) {
      console.debug('Team status not available:', error);
      return null;
    }
  },

  /**
   * Get comprehensive dashboard data (optimized version)
   */
  getDashboardData: async (): Promise<DashboardData> => {
    try {
      // Fetch core data in parallel for better performance
      const [
        tasks,
        projects, 
        users,
        notifications,
        unreadCount
      ] = await Promise.all([
        taskService.getAllTasks(),
        projectService.getAllProjects(),
        userService.getAllUsers(),
        notificationService.getNotifications(10),
        notificationService.getUnreadCount()
      ]);


      // Calculate stats with trends
      const stats = calculateDashboardStats(tasks, projects, users, unreadCount);
      
      // Transform activities
      const recentActivities = transformToActivities(tasks, projects, notifications);
      
      // Team status and monthly report are loaded separately for better performance
      const [teamStatus, monthlyReport] = await Promise.allSettled([
        dashboardService.getTeamStatus(),
        performanceService.getMonthlyReport().catch(() => null)
      ]);

      return {
        stats,
        recentActivities,
        teamStatus: teamStatus.status === 'fulfilled' ? (teamStatus.value || undefined) : undefined,
        monthlyReport: monthlyReport.status === 'fulfilled' ? (monthlyReport.value || undefined) : undefined
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
};

/**
 * Calculate dashboard statistics with trends
 */
function calculateDashboardStats(
  tasks: Task[], 
  projects: Project[], 
  users: User[], 
  unreadCount: number
): DashboardStats {
  // Filter tasks by status and date
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const activeTasks = tasks.filter(task => task.status !== 'completed');
  
  // Calculate trends (simplified - in a real app, you'd compare with previous periods)
  const totalTasks = tasks.length;
  const activeProjects = projects.length;
  const teamMembers = users.length;

  // For demo purposes, generate realistic trends
  const getRandomTrend = (): { value: string; trend: 'up' | 'down' | 'neutral' } => {
    const trends = [
      { value: '+12%', trend: 'up' as const },
      { value: '+8%', trend: 'up' as const },
      { value: '-3%', trend: 'down' as const },
      { value: '→', trend: 'neutral' as const }
    ];
    return trends[Math.floor(Math.random() * trends.length)];
  };

  return {
    totalTasks,
    tasksTrend: totalTasks > 0 ? { value: `+${Math.floor(totalTasks * 0.1)}`, trend: 'up' } : { value: '→', trend: 'neutral' },
    activeProjects,
    projectsTrend: activeProjects > 0 ? { value: `+${Math.floor(activeProjects * 0.2)}`, trend: 'up' } : { value: '→', trend: 'neutral' },
    teamMembers,
    membersTrend: { value: '→', trend: 'neutral' },
    unreadMessages: unreadCount,
    messagesTrend: unreadCount > 5 ? { value: '-5', trend: 'down' } : { value: '→', trend: 'neutral' }
  };
}

/**
 * Transform various data sources into unified activity format - optimized version
 */
function transformToActivities(
  tasks: Task[], 
  projects: Project[], 
  notifications: Notification[],
  limit: number = 8
): DashboardActivity[] {
  const activities: DashboardActivity[] = [];

  // Recent tasks (last 5)
  const recentTasks = tasks
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);
  
  recentTasks.forEach(task => {
    activities.push({
      id: `task-${task.id}`,
      type: 'task',
      title: task.status === 'completed' 
        ? `Task completed: "${task.title}"`
        : `Task ${task.status === 'in_progress' ? 'in progress' : 'assigned'}: "${task.title}"`,
      description: `Priority: ${task.priority}${task.due_date ? ` • Due: ${new Date(task.due_date).toLocaleDateString()}` : ''}`,
      timestamp: task.updated_at,
      user: task.assignee_name ? {
        name: task.assignee_name,
        avatar: undefined
      } : undefined,
      status: task.status === 'completed' ? 'completed' : 
              task.status === 'in_progress' ? 'in_progress' : 'pending'
    });
  });

  // Recent projects (last 2)
  const recentProjects = projects
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 2);
  
  recentProjects.forEach(project => {
    activities.push({
      id: `project-${project.id}`,
      type: 'project',
      title: `Project "${project.title}" ${project.progress_percentage === 100 ? 'completed' : 'updated'}`,
      description: `Progress: ${project.progress_percentage}% • ${project.task_count} tasks`,
      timestamp: project.created_at,
      user: project.creator_name ? {
        name: project.creator_name,
        avatar: undefined
      } : undefined,
      status: project.progress_percentage === 100 ? 'completed' : 'in_progress'
    });
  });

  // Recent notifications (last 3)
  const recentNotifications = notifications.slice(0, 3);
  recentNotifications.forEach(notification => {
    activities.push({
      id: `notification-${notification.id}`,
      type: getActivityTypeFromNotification(notification.type),
      title: notification.title,
      description: notification.message,
      timestamp: notification.created_at,
      status: 'pending'
    });
  });

  // Sort all activities by timestamp and limit results
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit); // Limit to specified number of recent activities
}

/**
 * Map notification types to activity types
 */
function getActivityTypeFromNotification(notificationType: string): DashboardActivity['type'] {
  const typeMap: Record<string, DashboardActivity['type']> = {
    'task_assigned': 'task',
    'task_completed': 'task',
    'project_assigned': 'project',
    'message': 'message',
    'document': 'document',
    'leave_request': 'leave',
    'performance_review': 'performance',
    'meeting': 'meeting'
  };
  
  return typeMap[notificationType] || 'message';
}

export default dashboardService;
