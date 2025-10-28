import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Eye, Users } from 'lucide-react';

export interface EmployeeData {
  id: string;
  name: string;
  title: string;
  department?: string;
  avatar_url?: string;
  isActive?: boolean;
  teamSize?: number;
}

interface ModernEmployeeCardProps {
  data: EmployeeData;
  onClick?: () => void;
  isDragging?: boolean;
  isDropTarget?: boolean;
}

const ModernEmployeeCard: React.FC<ModernEmployeeCardProps> = ({
  data,
  onClick,
  isDragging = false,
  isDropTarget = false,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-green-400 to-green-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.03, y: -2 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        className={`
          relative w-[220px] rounded-2xl cursor-pointer
          transition-all duration-250
          ${isDragging ? 'opacity-50' : ''}
          ${isDropTarget ? 'ring-4 ring-blue-400' : ''}
        `}
        style={{
          background: isDropTarget ? 'rgba(91, 142, 241, 0.1)' : 'rgba(255, 255, 255, 0.95)',
          border: isDropTarget ? '2px solid #5B8EF1' : '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: isHovered || isDropTarget
            ? '0 6px 20px rgba(91, 142, 241, 0.3)'
            : '0 4px 12px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Main Content */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div
              className={`
                flex-shrink-0 w-12 h-12 rounded-full
                flex items-center justify-center text-white font-medium text-sm
                bg-gradient-to-br ${getAvatarColor(data.name)}
                shadow-md
              `}
            >
              {data.avatar_url ? (
                <img
                  src={data.avatar_url}
                  alt={data.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(data.name)
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm leading-tight truncate">
                {data.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {data.title}
              </p>
              {data.department && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {data.department}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar with Actions */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            height: isHovered ? 'auto' : 0,
          }}
          className="border-t border-gray-100 overflow-hidden"
        >
          <div className="flex items-center justify-around px-2 py-2">
            {/* Active Status */}
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <div className={`w-2 h-2 rounded-full ${data.isActive !== false ? 'bg-green-400' : 'bg-gray-300'}`} />
              <span>{data.isActive !== false ? 'Active' : 'Away'}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle message
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Message"
              >
                <MessageCircle className="w-3.5 h-3.5 text-gray-500" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle view
                }}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="View Profile"
              >
                <Eye className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Team Size Badge */}
        {data.teamSize && data.teamSize > 0 && (
          <div className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-md flex items-center gap-1">
            <Users className="w-3 h-3" />
            {data.teamSize}
          </div>
        )}

        {/* Active Glow */}
        {data.isActive !== false && (
          <div
            className="absolute -inset-px rounded-2xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(91, 142, 241, 0.1), rgba(91, 142, 241, 0))',
            }}
          />
        )}
      </motion.div>
  );
};

export default ModernEmployeeCard;

