/**
 * Calendar View Component for Office Booking
 * Complete design consistency with HRMS
 */
import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  User as UserIcon,
  X,
} from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { CalendarEvent } from '../../services/officeBookingService';
import TRAXCIS_COLORS from '../../theme/traxcis';
import './CalendarView.css';

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  isDark: boolean;
}

interface CalendarEventWithDates extends CalendarEvent {
  start: Date;
  end: Date;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onEventClick,
  onSelectSlot,
  isDark,
}) => {
  const [view, setView] = useState<View>('week');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Theme colors
  const cardBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const cardBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  const textColor = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
  const subTextColor = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];
  const modalOverlayBg = isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)';

  // Convert events to calendar format
  const calendarEvents: CalendarEventWithDates[] = useMemo(() => {
    return events.map(event => ({
      ...event,
      start: new Date(event.start_time),
      end: new Date(event.end_time),
      title: event.title,
    }));
  }, [events]);

  // Custom event styling
  const eventStyleGetter = (event: any) => {
    let backgroundColor: string = TRAXCIS_COLORS.primary.DEFAULT;
    let borderColor: string = TRAXCIS_COLORS.primary[700];
    
    switch (event.status) {
      case 'upcoming':
        backgroundColor = TRAXCIS_COLORS.primary.DEFAULT;
        borderColor = TRAXCIS_COLORS.primary[700];
        break;
      case 'ongoing':
        backgroundColor = TRAXCIS_COLORS.status.success;
        borderColor = '#059669';
        break;
      case 'completed':
        backgroundColor = TRAXCIS_COLORS.secondary[400];
        borderColor = TRAXCIS_COLORS.secondary[600];
        break;
      case 'cancelled':
        backgroundColor = TRAXCIS_COLORS.status.error;
        borderColor = '#DC2626';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: '6px',
        color: '#FFFFFF',
        fontSize: '12px',
        fontWeight: '500' as const,
        padding: '4px 8px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      },
    };
  };

  // Custom toolbar
  const CustomToolbar = ({ label, onNavigate, onView }: any) => {
    return (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('PREV')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            style={{ color: textColor }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 style={{ color: textColor }} className="text-lg font-semibold min-w-[200px] text-center">
            {label}
          </h2>
          
          <button
            onClick={() => onNavigate('NEXT')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            style={{ color: textColor }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => onNavigate('TODAY')}
            style={{ 
              backgroundColor: isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[100],
              color: textColor,
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2">
          {(['month', 'week', 'day'] as View[]).map((viewType) => (
            <button
              key={viewType}
              onClick={() => onView(viewType)}
              style={{
                backgroundColor: view === viewType ? TRAXCIS_COLORS.primary.DEFAULT : 'transparent',
                color: view === viewType ? '#FFFFFF' : textColor,
                borderColor: cardBorder,
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-all capitalize"
            >
              {viewType}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event as CalendarEvent);
    if (onEventClick) {
      onEventClick(event as CalendarEvent);
    }
  };

  const handleSelectSlot = (slotInfo: any) => {
    if (onSelectSlot) {
      onSelectSlot({ start: slotInfo.start, end: slotInfo.end });
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      upcoming: { 
        bg: isDark ? 'rgba(37, 99, 235, 0.2)' : '#DBEAFE', 
        text: isDark ? '#93C5FD' : '#1E40AF', 
        label: 'Upcoming' 
      },
      ongoing: { 
        bg: isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5', 
        text: isDark ? '#6EE7B7' : '#065F46', 
        label: 'Ongoing' 
      },
      completed: { 
        bg: isDark ? 'rgba(107, 114, 128, 0.2)' : '#F3F4F6', 
        text: isDark ? '#D1D5DB' : '#4B5563', 
        label: 'Completed' 
      },
      cancelled: { 
        bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2', 
        text: isDark ? '#FCA5A5' : '#991B1B', 
        label: 'Cancelled' 
      },
    };
    return badges[status] || badges.upcoming;
  };

  return (
    <div>
      <div 
        style={{ 
          backgroundColor: cardBg,
          borderRadius: '12px',
          padding: '24px',
          border: `1px solid ${cardBorder}`,
        }}
        className="shadow-sm"
      >
        <CustomToolbar
          label={moment(date).format(view === 'month' ? 'MMMM YYYY' : 'MMM DD, YYYY')}
          onNavigate={(action: string) => {
            if (action === 'TODAY') {
              setDate(new Date());
            } else if (action === 'PREV') {
              setDate(moment(date).subtract(1, view === 'month' ? 'month' : 'week').toDate());
            } else if (action === 'NEXT') {
              setDate(moment(date).add(1, view === 'month' ? 'month' : 'week').toDate());
            }
          }}
          onView={(newView: View) => setView(newView)}
        />

        <div className={`calendar-container ${isDark ? 'dark-theme' : 'light-theme'}`}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
            style={{ 
              height: view === 'month' ? 600 : 500,
              fontFamily: "'Inter', 'Outfit', sans-serif",
            }}
            toolbar={false}
            formats={{
              dayHeaderFormat: (date: Date) => moment(date).format('ddd DD'),
              dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
                `${moment(start).format('MMM DD')} - ${moment(end).format('MMM DD, YYYY')}`,
              monthHeaderFormat: (date: Date) => moment(date).format('MMMM YYYY'),
            }}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-6 pt-6 border-t" style={{ borderColor: cardBorder }}>
          <span style={{ color: subTextColor }} className="text-xs font-medium uppercase">Legend:</span>
          {['upcoming', 'ongoing', 'completed', 'cancelled'].map((status) => {
            const badge = getStatusBadge(status);
            return (
              <div key={status} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: badge.bg, border: `2px solid ${badge.text}` }}
                />
                <span style={{ color: textColor }} className="text-xs font-medium capitalize">
                  {badge.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div
            style={{ backgroundColor: modalOverlayBg }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
              className="rounded-2xl p-6 w-full max-w-md shadow-xl border"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 style={{ color: textColor }} className="text-xl font-semibold mb-2">
                    {selectedEvent.title}
                  </h2>
                  <span
                    style={{
                      backgroundColor: getStatusBadge(selectedEvent.status).bg,
                      color: getStatusBadge(selectedEvent.status).text,
                    }}
                    className="px-3 py-1 rounded-full text-xs font-semibold inline-block"
                  >
                    {getStatusBadge(selectedEvent.status).label}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  style={{ color: subTextColor }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Details */}
              <div className="space-y-4">
                {/* Office */}
                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${TRAXCIS_COLORS.primary.DEFAULT}15` }}
                  >
                    <MapPin className="w-5 h-5" style={{ color: TRAXCIS_COLORS.primary.DEFAULT }} />
                  </div>
                  <div>
                    <p style={{ color: subTextColor }} className="text-xs font-medium">Office</p>
                    <p style={{ color: textColor }} className="text-sm font-semibold">
                      {selectedEvent.office_name}
                    </p>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${TRAXCIS_COLORS.status.info}15` }}
                  >
                    <Clock className="w-5 h-5" style={{ color: TRAXCIS_COLORS.status.info }} />
                  </div>
                  <div>
                    <p style={{ color: subTextColor }} className="text-xs font-medium">Date & Time</p>
                    <p style={{ color: textColor }} className="text-sm font-semibold">
                      {moment(selectedEvent.start_time).format('MMM DD, YYYY')}
                    </p>
                    <p style={{ color: subTextColor }} className="text-xs">
                      {moment(selectedEvent.start_time).format('h:mm A')} - {moment(selectedEvent.end_time).format('h:mm A')}
                    </p>
                  </div>
                </div>

                {/* Organizer */}
                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${TRAXCIS_COLORS.accent.DEFAULT}15` }}
                  >
                    <UserIcon className="w-5 h-5" style={{ color: TRAXCIS_COLORS.accent.DEFAULT }} />
                  </div>
                  <div>
                    <p style={{ color: subTextColor }} className="text-xs font-medium">Organizer</p>
                    <p style={{ color: textColor }} className="text-sm font-semibold">
                      {selectedEvent.organizer_name}
                    </p>
                  </div>
                </div>

                {/* Participants */}
                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${TRAXCIS_COLORS.status.success}15` }}
                  >
                    <Users className="w-5 h-5" style={{ color: TRAXCIS_COLORS.status.success }} />
                  </div>
                  <div>
                    <p style={{ color: subTextColor }} className="text-xs font-medium">Participants</p>
                    <p style={{ color: textColor }} className="text-sm font-semibold">
                      {selectedEvent.participant_count} {selectedEvent.participant_count === 1 ? 'person' : 'people'}
                    </p>
                    {selectedEvent.is_participant && (
                      <p style={{ color: TRAXCIS_COLORS.status.success }} className="text-xs mt-1">
                        ✓ You're invited
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t" style={{ borderColor: cardBorder }}>
                <button
                  onClick={() => setSelectedEvent(null)}
                  style={{ 
                    backgroundColor: TRAXCIS_COLORS.primary.DEFAULT,
                  }}
                  className="w-full px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarView;

