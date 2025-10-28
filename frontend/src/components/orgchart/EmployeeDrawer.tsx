import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, MapPin, Briefcase, Calendar, Users, Edit } from 'lucide-react';

export interface EmployeeDetails {
  id: string;
  name: string;
  title: string;
  department?: string;
  email?: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
  joinDate?: string;
  teamSize?: number;
  manager?: string;
}

interface EmployeeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeDetails | null;
  onEdit?: () => void;
}

const EmployeeDrawer: React.FC<EmployeeDrawerProps> = ({
  isOpen,
  onClose,
  employee,
  onEdit,
}) => {
  if (!employee) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            style={{ backdropFilter: 'blur(4px)' }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="relative">
              {/* Background Pattern */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%235B8EF1\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                }}
              />

              {/* Content */}
              <div className="relative px-6 pt-6 pb-8 bg-gradient-to-br from-blue-50 to-white">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>

                {/* Avatar */}
                <div className="flex flex-col items-center text-center mb-4">
                  <div
                    className={`
                      w-24 h-24 rounded-full mb-4
                      flex items-center justify-center text-white font-medium text-2xl
                      bg-gradient-to-br ${getAvatarColor(employee.name)}
                      shadow-xl
                    `}
                  >
                    {employee.avatar_url ? (
                      <img
                        src={employee.avatar_url}
                        alt={employee.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(employee.name)
                    )}
                  </div>

                  <h2 className="text-2xl font-medium text-gray-900 mb-1">
                    {employee.name}
                  </h2>
                  <p className="text-sm text-gray-600 mb-1">{employee.title}</p>
                  {employee.department && (
                    <p className="text-sm text-gray-500">{employee.department}</p>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={onEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {employee.email && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="p-2 bg-white rounded-lg">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900">{employee.email}</p>
                      </div>
                    </div>
                  )}

                  {employee.phone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="p-2 bg-white rounded-lg">
                        <Phone className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{employee.phone}</p>
                      </div>
                    </div>
                  )}

                  {employee.location && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="p-2 bg-white rounded-lg">
                        <MapPin className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm font-medium text-gray-900">{employee.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Work Information */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Work Information
                </h3>
                <div className="space-y-3">
                  {employee.joinDate && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="p-2 bg-white rounded-lg">
                        <Calendar className="w-4 h-4 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Join Date</p>
                        <p className="text-sm font-medium text-gray-900">{employee.joinDate}</p>
                      </div>
                    </div>
                  )}

                  {employee.manager && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="p-2 bg-white rounded-lg">
                        <Briefcase className="w-4 h-4 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Reports To</p>
                        <p className="text-sm font-medium text-gray-900">{employee.manager}</p>
                      </div>
                    </div>
                  )}

                  {employee.teamSize !== undefined && employee.teamSize > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="p-2 bg-white rounded-lg">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Team Size</p>
                        <p className="text-sm font-medium text-gray-900">
                          {employee.teamSize} {employee.teamSize === 1 ? 'member' : 'members'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmployeeDrawer;

