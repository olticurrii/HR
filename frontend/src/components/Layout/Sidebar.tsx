import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  FolderOpen, 
  Clock, 
  Calendar,
  MessageSquare,
  MessageCircle,
  FileText,
  BarChart3,
  Users,
  Settings,
  User,
  Network
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, permission: { resource: 'profile', action: 'view' } },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare, permission: { resource: 'profile', action: 'view' } },
  { name: 'Projects', href: '/projects', icon: FolderOpen, permission: { resource: 'profile', action: 'view' } },
  { name: 'Time Tracking', href: '/time-tracking', icon: Clock, permission: { resource: 'profile', action: 'view' } },
  { name: 'Leave Management', href: '/leave-management', icon: Calendar, permission: { resource: 'profile', action: 'view' } },
  { name: 'Feedback', href: '/feedback', icon: MessageCircle, permission: { resource: 'profile', action: 'view' } },
  { name: 'Documents', href: '/documents', icon: FileText, permission: { resource: 'profile', action: 'view' } },
  { name: 'AI Insights', href: '/ai-insights', icon: BarChart3, permission: { resource: 'profile', action: 'view' } },
  { name: 'Chat', href: '/chat', icon: MessageSquare, permission: { resource: 'profile', action: 'view' } },
  { name: 'Org Chart', href: '/people/org-chart', icon: Network, permission: { resource: 'profile', action: 'view' } },
  { name: 'User Management', href: '/user-management', icon: Users, permission: { resource: 'users', action: 'view' } },
  { name: 'Settings', href: '/settings', icon: Settings, permission: { resource: 'settings', action: 'view' } },
  { name: 'Profile', href: '/profile', icon: User, permission: { resource: 'profile', action: 'view' } },
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const hasPermission = (permission: { resource: string; action: string }) => {
    // Simple permission check - in a real app, this would be more sophisticated
    if (permission.resource === 'users' || permission.resource === 'settings') {
      return user?.is_admin || false;
    }
    return true;
  };

  const filteredNavigation = navigation.filter(item => hasPermission(item.permission));

  return (
    <div className="w-64 bg-white shadow-sm border-r">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
      </div>
      
      <nav className="px-4 pb-4">
        <ul className="space-y-2">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
