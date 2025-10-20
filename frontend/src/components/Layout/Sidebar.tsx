import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  FolderOpen, 
  Clock, 
  Calendar,
  MessageSquare,
  MessageCircle,
  Users,
  Settings,
  User,
  Network,
  Shield,
  Lock,
  UserCog,
  ChevronDown,
  ChevronRight,
  Briefcase,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { settingsService } from '../../services/settingsService';

// Regular navigation items (not in dropdown)
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'manager', 'employee'] },
  { name: 'Performance', href: '/performance', icon: TrendingUp, roles: ['admin', 'manager', 'employee'], requiresPerformanceModule: true },
  { name: 'Time Tracking', href: '/time-tracking', icon: Clock, roles: ['admin', 'manager', 'employee'] },
  { name: 'Leave Management', href: '/leave-management', icon: Calendar, roles: ['admin', 'manager', 'employee'] },
  { name: 'Feedback', href: '/feedback', icon: MessageCircle, roles: ['admin', 'manager', 'employee'] },
  { name: 'Chat', href: '/chat', icon: MessageSquare, roles: ['admin', 'manager', 'employee'] },
];

// Analytics dropdown items (Admin only)
const analyticsDropdownItems = [
  { name: 'Feedback Insights', href: '/feedback/insights', icon: TrendingUp, roles: ['admin'] },
  { name: 'Admin Time Tracking', href: '/time-tracking/admin', icon: BarChart3, roles: ['admin', 'manager'] },
];

// Workflow dropdown items
const workflowDropdownItems = [
  { name: 'Tasks', href: '/tasks', icon: CheckSquare, roles: ['admin', 'manager', 'employee'] },
  { name: 'Projects', href: '/projects', icon: FolderOpen, roles: ['admin', 'manager', 'employee'] },
];

// Users dropdown items
const usersDropdownItems = [
  { name: 'Org Chart', href: '/people/org-chart', icon: Network, roles: ['admin', 'manager'] },
  { name: 'User Management', href: '/user-management', icon: Users, roles: ['admin'] },
  { name: 'Role Management', href: '/role-management', icon: Shield, roles: ['admin'] },
  { name: 'Roles', href: '/roles', icon: UserCog, roles: ['admin'] },
  { name: 'Permissions', href: '/permissions', icon: Lock, roles: ['admin'] },
];

// Bottom navigation items
const bottomNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] },
  { name: 'Profile', href: '/profile', icon: User, roles: ['admin', 'manager', 'employee'] },
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [workflowDropdownOpen, setWorkflowDropdownOpen] = useState(true);
  const [usersDropdownOpen, setUsersDropdownOpen] = useState(true);
  const [analyticsDropdownOpen, setAnalyticsDropdownOpen] = useState(true);
  const [performanceModuleEnabled, setPerformanceModuleEnabled] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await settingsService.getOrgSettings();
        setPerformanceModuleEnabled(settings.performance_module_enabled);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    loadSettings();
  }, []);

  const hasAccess = (allowedRoles: string[]) => {
    // Check if current user's role is in the allowed roles
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const filteredNavigation = navigation.filter(item => {
    // Check role access
    if (!hasAccess(item.roles)) return false;
    
    // Check if performance module is required and enabled
    if ((item as any).requiresPerformanceModule && !performanceModuleEnabled) {
      return false;
    }
    
    return true;
  });
  const filteredWorkflowDropdown = workflowDropdownItems.filter(item => hasAccess(item.roles));
  const filteredUsersDropdown = usersDropdownItems.filter(item => hasAccess(item.roles));
  const filteredAnalyticsDropdown = analyticsDropdownItems.filter(item => hasAccess(item.roles));
  const filteredBottomNavigation = bottomNavigation.filter(item => hasAccess(item.roles));

  // Check if any workflow dropdown route is active
  const isWorkflowDropdownActive = workflowDropdownItems.some(item => location.pathname.startsWith(item.href));

  // Check if any users dropdown route is active
  const isUsersDropdownActive = usersDropdownItems.some(item => location.pathname === item.href);

  // Check if any analytics dropdown route is active
  const isAnalyticsDropdownActive = analyticsDropdownItems.some(item => location.pathname.startsWith(item.href));

  return (
    <div className="w-64 bg-white shadow-sm border-r flex flex-col h-screen">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
      </div>
      
      <nav className="px-4 pb-4 flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {/* Regular navigation items */}
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

          {/* Workflow Dropdown */}
          {filteredWorkflowDropdown.length > 0 && (
            <li>
              <button
                onClick={() => setWorkflowDropdownOpen(!workflowDropdownOpen)}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isWorkflowDropdownActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-3" />
                  Workflow
                </div>
                {workflowDropdownOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {/* Dropdown Items */}
              {workflowDropdownOpen && (
                <ul className="mt-2 ml-4 space-y-1 border-l-2 border-gray-200 pl-4">
                  {filteredWorkflowDropdown.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.name}>
                        <NavLink
                          to={item.href}
                          className={({ isActive }) =>
                            `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`
                          }
                        >
                          <Icon className="w-4 h-4 mr-3" />
                          {item.name}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          )}

          {/* Users Dropdown */}
          {filteredUsersDropdown.length > 0 && (
            <li>
              <button
                onClick={() => setUsersDropdownOpen(!usersDropdownOpen)}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isUsersDropdownActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3" />
                  Users
                </div>
                {usersDropdownOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {/* Dropdown Items */}
              {usersDropdownOpen && (
                <ul className="mt-2 ml-4 space-y-1 border-l-2 border-gray-200 pl-4">
                  {filteredUsersDropdown.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.name}>
                        <NavLink
                          to={item.href}
                          className={({ isActive }) =>
                            `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`
                          }
                        >
                          <Icon className="w-4 h-4 mr-3" />
                          {item.name}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          )}

          {/* Analytics Dropdown */}
          {filteredAnalyticsDropdown.length > 0 && (
            <li>
              <button
                onClick={() => setAnalyticsDropdownOpen(!analyticsDropdownOpen)}
                className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isAnalyticsDropdownActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-3" />
                  Analytics
                </div>
                {analyticsDropdownOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {/* Dropdown Items */}
              {analyticsDropdownOpen && (
                <ul className="mt-2 ml-4 space-y-1 border-l-2 border-gray-200 pl-4">
                  {filteredAnalyticsDropdown.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.name}>
                        <NavLink
                          to={item.href}
                          className={({ isActive }) =>
                            `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isActive
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`
                          }
                        >
                          <Icon className="w-4 h-4 mr-3" />
                          {item.name}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          )}

          {/* Divider */}
          <li className="border-t border-gray-200 my-4"></li>

          {/* Bottom navigation items */}
          {filteredBottomNavigation.map((item) => {
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
