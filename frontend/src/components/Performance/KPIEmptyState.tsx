import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  Lightbulb,
  ArrowRight,
  Plus
} from 'lucide-react';

interface KPIEmptyStateProps {
  onRecordKPI: () => void;
  onLearnMore?: () => void;
}

const KPIEmptyState: React.FC<KPIEmptyStateProps> = ({
  onRecordKPI,
  onLearnMore,
}) => {
  const benefits = [
    {
      icon: Target,
      title: 'Track Performance',
      description: 'Monitor key metrics over time'
    },
    {
      icon: TrendingUp,
      title: 'See Trends',
      description: 'Identify patterns and improvements'
    },
    {
      icon: BarChart3,
      title: 'Visual Analytics',
      description: 'Beautiful charts and insights'
    },
    {
      icon: CheckCircle,
      title: 'Goal Achievement',
      description: 'Measure progress toward objectives'
    }
  ];

  const kpiExamples = [
    { name: 'Task Completion Rate', value: '85%', color: 'blue' },
    { name: 'Customer Satisfaction', value: '4.2/5', color: 'green' },
    { name: 'Project Delivery', value: '92%', color: 'purple' },
    { name: 'Innovation Projects', value: '3', color: 'orange' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-16 px-8"
      >
        {/* Hero Section */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-24 h-24 mx-auto mb-8 gradient-primary rounded-3xl flex items-center justify-center shadow-2xl"
      >
        <TrendingUp className="w-12 h-12 text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-3xl font-medium text-gray-900 dark:text-white mb-4">
            Automated KPI Tracking
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Your KPIs are automatically calculated from existing data - no manual entry needed! 
            The system analyzes your Tasks, Projects, and Time Tracking to generate performance insights every 6 hours.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            className="bg-white dark:bg-secondary-800 rounded-2xl p-6 border border-gray-200 dark:border-secondary-700 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <benefit.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* KPI Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 mb-12 border border-primary-200 dark:border-blue-800"
        >
          <div className="flex items-center justify-center mb-6">
            <Lightbulb className="w-6 h-6 text-amber-500 mr-3" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              Popular KPI Examples
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiExamples.map((kpi, index) => (
              <motion.div
                key={kpi.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center"
              >
                <div className={`w-3 h-3 bg-${kpi.color}-500 rounded-full mx-auto mb-3`}></div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {kpi.name}
                </p>
                <p className={`text-lg font-medium text-${kpi.color}-600 dark:text-${kpi.color}-400`}>
                  {kpi.value}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Getting Started Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-12 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-8">
            Getting Started is Easy
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create Tasks & Projects',
                description: 'Work on your regular tasks and projects as usual',
                icon: Target
              },
              {
                step: '2', 
                title: 'Log Your Time',
                description: 'Track your work hours using Time Tracking',
                icon: Plus
              },
              {
                step: '3',
                title: 'KPIs Auto-Calculate',
                description: 'System analyzes your data and generates metrics automatically',
                icon: TrendingUp
              }
            ].map((step, index) => (
              <div key={step.step} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-4 relative">
                    <step.icon className="w-8 h-8 text-white" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-xs font-medium text-primary dark:text-blue-400 border-2 border-primary">
                      {step.step}
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
                
                {/* Arrow between steps */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-8 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 transform -translate-x-4">
                    <ArrowRight className="w-4 h-4 text-blue-400 absolute right-0 top-1/2 transform -translate-y-1/2" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
        >
          <motion.button
            onClick={onRecordKPI}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-8 py-4 bg-accent hover:bg-accent-600 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Lightbulb className="w-6 h-6 mr-3" />
            Calculate KPIs Now
          </motion.button>
          
          {onLearnMore && (
            <motion.button
              onClick={onLearnMore}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center px-6 py-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Lightbulb className="w-5 h-5 mr-2" />
              Learn More About KPIs
            </motion.button>
          )}
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800"
        >
          <div className="flex items-start space-x-3">
            <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">
                💡 How It Works
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-200">
                The system automatically calculates 7 key metrics from your daily work. 
                Just complete tasks, log time, and work on projects - KPIs update automatically every 6 hours. 
                No manual data entry required!
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default KPIEmptyState;
