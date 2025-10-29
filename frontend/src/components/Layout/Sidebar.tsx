import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  TrendingUp,
  Building,
  Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { settingsService } from '../../services/settingsService';

// Navigation sections with modern grouping and visual hierarchy
const navigationSections = [
  {
    title: 'Core',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['admin', 'manager', 'employee'] },
    ]
  },
  {
    title: 'Operations',
    items: [
      { name: 'Tasks', href: '/tasks', icon: CheckSquare, roles: ['admin', 'manager', 'employee'] },
      { name: 'Projects', href: '/projects', icon: FolderOpen, roles: ['admin', 'manager', 'employee'] },
      { name: 'Time Tracking', href: '/time-tracking', icon: Clock, roles: ['admin', 'manager', 'employee'] },
      { name: 'Leave Management', href: '/leave-management', icon: Calendar, roles: ['admin', 'manager', 'employee'] },
      { name: 'Office Booking', href: '/office-booking', icon: Building, roles: ['admin', 'manager', 'employee'] },
      { name: 'Chat', href: '/chat', icon: MessageSquare, roles: ['admin', 'manager', 'employee'] },
    ]
  },
  {
    title: 'Performance',
    items: [
      { name: 'Performance', href: '/performance', icon: TrendingUp, roles: ['admin', 'manager', 'employee'], requiresPerformanceModule: true },
      { name: 'Feedback', href: '/feedback', icon: MessageCircle, roles: ['admin', 'manager', 'employee'] },
    ]
  },
  {
    title: 'People',
    items: [
      { name: 'Org Chart', href: '/people/org-chart', icon: Network, roles: ['admin', 'manager'] },
      { name: 'User Management', href: '/user-management', icon: Users, roles: ['admin'] },
      { name: 'Role Management', href: '/role-management', icon: Shield, roles: ['admin'] },
      { name: 'Roles', href: '/roles', icon: UserCog, roles: ['admin'] },
      { name: 'Permissions', href: '/permissions', icon: Lock, roles: ['admin'] },
    ]
  },
  {
    title: 'Analytics',
    items: [
      { name: 'Feedback Insights', href: '/feedback/insights', icon: BarChart3, roles: ['admin'] },
      { name: 'Admin Time Tracking', href: '/time-tracking/admin', icon: Clock, roles: ['admin', 'manager'] },
    ]
  }
];

// Bottom navigation items
const bottomNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] },
  { name: 'Profile', href: '/profile', icon: User, roles: ['admin', 'manager', 'employee'] },
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [performanceModuleEnabled, setPerformanceModuleEnabled] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

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
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const toggleSection = (sectionTitle: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const isSectionActive = (items: any[]) => {
    return items.some(item => location.pathname.startsWith(item.href));
  };

  return (
    <div className="w-64 bg-white dark:bg-neutral-dark shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <img 
            src="/Screenshot 2025-10-29 at 14.17.07.png" 
            alt="Traxcis Logo" 
            className="h-14 w-auto object-contain"
          />
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-8">
          {/* Navigation Sections */}
          {navigationSections.map((section) => {
            const filteredItems = section.items.filter(item => {
              // Check role access
              if (!hasAccess(item.roles)) return false;
              
              // Check if performance module is required and enabled
              if ((item as any).requiresPerformanceModule && !performanceModuleEnabled) {
                return false;
              }
              
              return true;
            });

            // Don't render section if no items are accessible
            if (filteredItems.length === 0) return null;

            const isCollapsed = collapsedSections[section.title];
            const hasActiveItem = isSectionActive(filteredItems);
            
            return (
              <div key={section.title}>
                {/* Section Header */}
                <motion.button
                  onClick={() => toggleSection(section.title)}
                  className={`flex items-center justify-between w-full text-left mb-3 px-2 py-1 rounded-lg transition-all duration-200 group ${
                    hasActiveItem 
                      ? 'text-accent dark:text-accent-400' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:text-accent'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-xs font-medium uppercase tracking-wider">{section.title}</span>
                  <motion.div
                    animate={{ rotate: isCollapsed ? -90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </motion.button>

                {/* Section Items */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-1"
                    >
                      {filteredItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                              `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                                isActive
                                  ? 'gradient-accent text-white shadow-lg shadow-accent/25 accent-underline'
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:text-accent'
                              }`
                            }
                          >
                            <Icon className="w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110" />
                            <span>{item.name}</span>
                          </NavLink>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          {/* Bottom Navigation */}
          <div className="space-y-1">
            {bottomNavigation
              .filter(item => hasAccess(item.roles))
              .map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                        isActive
                          ? 'gradient-accent text-white shadow-lg shadow-accent/25 accent-underline'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:text-accent'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
