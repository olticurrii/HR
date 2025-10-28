import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Building2, Coffee, TrendingUp, Calendar, Play } from 'lucide-react';

interface EmptyStateProps {
  onClockIn: (isTerrain: boolean) => void;
  loading?: boolean;
  userName?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  onClockIn,
  loading = false,
  userName = 'there'
}) => {
  const currentTime = new Date();
  const timeOfDay = currentTime.getHours();
  
  const getGreeting = () => {
    if (timeOfDay < 12) return 'Good morning';
    if (timeOfDay < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Ready to make today productive?",
      "Let's track your amazing work!",
      "Time to start another successful day!",
      "Your productivity journey begins now!",
      "Ready to make today count?"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const features = [
    {
      icon: Clock,
      title: 'Accurate Tracking',
      description: 'Precisely track your working hours with automatic calculations'
    },
    {
      icon: MapPin,
      title: 'Location Flexibility',
      description: 'Switch between office and terrain work modes seamlessly'
    },
    {
      icon: Coffee,
      title: 'Break Management',
      description: 'Take breaks when needed and track your rest time'
    },
    {
      icon: TrendingUp,
      title: 'Progress Insights',
      description: 'View your productivity trends and time analytics'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center py-12"
    >
      {/* Main Illustration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative mx-auto mb-8 w-48 h-48"
      >
        {/* Background Circle */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full"></div>
        
        {/* Floating Icons */}
        <motion.div
          animate={{ 
            rotate: 360,
            transition: { duration: 20, repeat: Infinity, ease: "linear" }
          }}
          className="absolute inset-0"
        >
          <motion.div
            animate={{ 
              y: [-5, 5, -5],
              transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute top-4 right-8 w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg"
          >
            <Clock className="w-5 h-5 text-white" />
          </motion.div>
          
          <motion.div
            animate={{ 
              y: [5, -5, 5],
              transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
            }}
            className="absolute bottom-6 left-6 w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg"
          >
            <TrendingUp className="w-5 h-5 text-white" />
          </motion.div>
          
          <motion.div
            animate={{ 
              y: [-3, 7, -3],
              transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }
            }}
            className="absolute top-12 left-4 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md"
          >
            <Coffee className="w-4 h-4 text-white" />
          </motion.div>
        </motion.div>

        {/* Central Clock Icon */}
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Clock className="w-10 h-10 text-white" />
          </div>
        </motion.div>
      </motion.div>

      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-medium text-gray-900 dark:text-white mb-2">
          {getGreeting()}, {userName}! 👋
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
          {getMotivationalMessage()}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          You're currently clocked out. Start tracking your time by clocking in below.
        </p>
      </motion.div>

      {/* Clock In Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4 justify-center mb-12 max-w-md mx-auto"
      >
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onClockIn(false)}
          disabled={loading}
          className="flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Building2 className="w-5 h-5" />
          <span>Clock In (Office)</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onClockIn(true)}
          disabled={loading}
          className="flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MapPin className="w-5 h-5" />
          <span>Clock In (Terrain)</span>
        </motion.button>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 + (index * 0.1) }}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Today's Date and Quick Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 max-w-2xl mx-auto"
      >
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-primary dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
        
        <div className="text-center">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 Quick Tip
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Choose the right work mode: Office for desk work, Terrain for field assignments. 
            You can switch between them during your work session if needed.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EmptyState;
