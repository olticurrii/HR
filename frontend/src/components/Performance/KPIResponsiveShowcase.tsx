import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Moon, 
  Sun, 
  Check,
  Eye,
  Grid,
  BarChart3
} from 'lucide-react';

/**
 * This component showcases the responsive design and dark mode capabilities
 * of the KPI Dashboard across different screen sizes and themes.
 */

interface ResponsiveTestProps {
  children: React.ReactNode;
}

const ResponsiveShowcase: React.FC<ResponsiveTestProps> = ({ children }) => {
  const [currentView, setCurrentView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const viewports = [
    { id: 'desktop', icon: Monitor, label: 'Desktop', width: '100%', description: '1024px+' },
    { id: 'tablet', icon: Tablet, label: 'Tablet', width: '768px', description: '768px - 1023px' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile', width: '375px', description: '320px - 767px' },
  ] as const;

  const responsiveFeatures = [
    'Adaptive grid layouts (1-5 columns based on screen size)',
    'Collapsible navigation and filters on mobile',
    'Touch-optimized chart interactions',
    'Responsive typography scaling',
    'Flexible card layouts with proper spacing',
    'Mobile-first component architecture',
  ];

  const darkModeFeatures = [
    'Consistent dark theme across all components',
    'Proper contrast ratios for accessibility',
    'Smooth theme transitions with animations',
    'Dark-optimized chart colors and gradients',
    'Context-aware border and shadow adjustments',
    'System theme preference detection',
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Control Panel */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
          {/* Viewport Controls */}
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Responsive Preview
            </h2>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {viewports.map((viewport) => (
                <button
                  key={viewport.id}
                  onClick={() => setCurrentView(viewport.id)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    currentView === viewport.id
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <viewport.icon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{viewport.label}</span>
                  <span className="sm:hidden">{viewport.icon.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Toggle & Info */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Current: {viewports.find(v => v.id === currentView)?.description}
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 mr-2" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 mr-2" />
                  Dark Mode
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Container */}
      <div className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Features Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Responsive Features */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Grid className="w-6 h-6 mr-3 text-primary dark:text-blue-400" />
                Responsive Design Features
              </h3>
              <ul className="space-y-3">
                {responsiveFeatures.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300 text-sm">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Dark Mode Features */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Moon className="w-6 h-6 mr-3 text-purple-600 dark:text-purple-400" />
                Dark Mode Features
              </h3>
              <ul className="space-y-3">
                {darkModeFeatures.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300 text-sm">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Responsive Preview Frame */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-2xl"
          >
            <div className="bg-gray-100 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    KPI Dashboard - {viewports.find(v => v.id === currentView)?.label} View
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {viewports.find(v => v.id === currentView)?.width}
                </div>
              </div>
            </div>

            {/* Content Frame */}
            <div className="p-4 bg-gray-50 dark:bg-neutral-dark min-h-[600px] overflow-auto">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="mx-auto"
                style={{
                  maxWidth: currentView === 'desktop' ? '100%' : 
                           currentView === 'tablet' ? '768px' : '375px',
                  width: '100%',
                }}
              >
                {children}
              </motion.div>
            </div>
          </motion.div>

          {/* Responsive Breakpoints Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-primary-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-primary-200 dark:border-blue-800"
          >
            <h4 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Tailwind CSS Responsive Breakpoints
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-primary-200 dark:border-blue-700">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Mobile First</div>
                <div className="text-xs text-blue-700 dark:text-blue-200">Default (no prefix)</div>
                <div className="text-xs text-primary dark:text-blue-300 mt-2">320px - 767px</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-primary-200 dark:border-blue-700">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Tablet</div>
                <div className="text-xs text-blue-700 dark:text-blue-200">md: prefix</div>
                <div className="text-xs text-primary dark:text-blue-300 mt-2">768px - 1023px</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-primary-200 dark:border-blue-700">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Desktop</div>
                <div className="text-xs text-blue-700 dark:text-blue-200">lg: prefix</div>
                <div className="text-xs text-primary dark:text-blue-300 mt-2">1024px+</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveShowcase;
