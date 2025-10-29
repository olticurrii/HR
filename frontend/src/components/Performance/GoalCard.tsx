import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle, Edit } from 'lucide-react';
import type { Goal } from '../../services/performanceService';
import GoalProgressUpdater from './GoalProgressUpdater';
import TRAXCIS_COLORS from '../../theme/traxcis';

interface GoalCardProps {
  goal: Goal;
  onGoalUpdated?: () => void;
  isApprovalView?: boolean;
  onApprove?: (goalId: number) => void;
  onReject?: (goalId: number) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onGoalUpdated,
  isApprovalView = false,
  onApprove,
  onReject,
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { 
          icon: CheckCircle, 
          bgColor: '#D1FAE5',
          textColor: '#065F46',
          borderColor: '#A7F3D0',
          label: 'Completed' 
        };
      case 'pending':
        return { 
          icon: Clock, 
          bgColor: '#FEF3C7',
          textColor: '#92400E',
          borderColor: '#FDE68A',
          label: 'Pending' 
        };
      case 'active':
        return { 
          icon: AlertCircle, 
          bgColor: '#DBEAFE',
          textColor: '#1E40AF',
          borderColor: '#BFDBFE',
          label: 'Active' 
        };
      default:
        return { 
          icon: XCircle, 
          bgColor: '#F3F4F6',
          textColor: '#374151',
          borderColor: '#E5E7EB',
          label: status 
        };
    }
  };

  const statusConfig = getStatusConfig(goal.status);
  const StatusIcon = statusConfig.icon;
  const isOverdue = goal.due_date && new Date(goal.due_date) < new Date() && goal.status === 'active';
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  // Card background: use neutral light in light mode, secondary dark in dark mode
  const cardBg = isDark ? TRAXCIS_COLORS.secondary[900] : TRAXCIS_COLORS.neutral.light;
  // Border: use secondary colors
  const cardBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  // Main text: use secondary for body text
  const textColor = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
  // Subtext: use secondary lighter shades
  const subTextColor = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        backgroundColor: cardBg,
        borderRadius: '16px',
        border: `1px solid ${cardBorder}`,
        boxShadow: isDark ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        padding: '24px',
        transition: 'all 0.3s ease',
      }}
      whileHover={{
        boxShadow: isDark ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: textColor,
          fontFamily: "'Outfit', sans-serif",
          marginBottom: '8px',
        }}>
          {goal.title}
        </h3>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 10px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '500',
          backgroundColor: statusConfig.bgColor,
          color: statusConfig.textColor,
          border: `1px solid ${statusConfig.borderColor}`,
          fontFamily: "'Outfit', sans-serif",
        }}>
          <StatusIcon style={{ width: '12px', height: '12px', marginRight: '6px' }} />
          {statusConfig.label}
        </span>
      </div>

      {/* Description */}
      {goal.description && (
        <p style={{
          color: subTextColor,
          fontSize: '14px',
          marginBottom: '16px',
          fontFamily: "'Outfit', sans-serif",
        }}>
          {goal.description}
        </p>
      )}

      {/* Progress */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            color: isDark ? TRAXCIS_COLORS.secondary[300] : TRAXCIS_COLORS.secondary[700],
            fontFamily: "'Outfit', sans-serif",
          }}>
            Progress
          </span>
          <span style={{
            fontSize: '14px',
            fontWeight: '700',
            color: TRAXCIS_COLORS.accent.DEFAULT,
            fontFamily: "'Outfit', sans-serif",
          }}>
            {goal.progress}%
          </span>
        </div>
        <div style={{
          width: '100%',
          backgroundColor: isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200],
          borderRadius: '9999px',
          height: '8px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            backgroundColor: TRAXCIS_COLORS.accent.DEFAULT,
            borderRadius: '9999px',
            width: `${goal.progress}%`,
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Dates */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: subTextColor,
        marginBottom: '16px',
        fontFamily: "'Outfit', sans-serif",
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Calendar style={{ width: '12px', height: '12px', marginRight: '4px' }} />
          <span>Created: {new Date(goal.created_at).toLocaleDateString()}</span>
        </div>
        {goal.due_date && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            color: isOverdue ? '#DC2626' : '#6B7280',
          }}>
            <Clock style={{ width: '12px', height: '12px', marginRight: '4px' }} />
            <span>Due: {new Date(goal.due_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {isApprovalView ? (
          <>
            <button
              onClick={() => onApprove?.(goal.id)}
              style={{
                flex: 1,
                padding: '8px 16px',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
                fontFamily: "'Outfit', sans-serif",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10B981'}
            >
              Approve
            </button>
            <button
              onClick={() => onReject?.(goal.id)}
              style={{
                flex: 1,
                padding: '8px 16px',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
                fontFamily: "'Outfit', sans-serif",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EF4444'}
            >
              Reject
            </button>
          </>
        ) : (
          <button 
            onClick={() => setShowProgressModal(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 16px',
              backgroundColor: TRAXCIS_COLORS.accent.DEFAULT,
              color: '#FFFFFF',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
              fontFamily: "'Outfit', sans-serif",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.accent[600]}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = TRAXCIS_COLORS.accent.DEFAULT}
          >
            <Edit style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            Update Progress
          </button>
        )}
      </div>

      {/* Progress Update Modal */}
      {showProgressModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            maxWidth: '448px',
            width: '100%',
            padding: '24px',
          }}>
            <GoalProgressUpdater
              goalId={goal.id}
              currentProgress={goal.progress}
              onProgressUpdated={() => {
                setShowProgressModal(false);
                onGoalUpdated?.();
              }}
            />
            <button
              onClick={() => setShowProgressModal(false)}
              style={{
                marginTop: '16px',
                width: '100%',
                padding: '8px 16px',
                color: '#374151',
                backgroundColor: '#F3F4F6',
                borderRadius: '8px',
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease',
                fontFamily: "'Outfit', sans-serif",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default GoalCard;
