/**
 * Office Booking & Meeting Scheduler Page
 * Complete design consistency with HRMS system
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Plus,
  Calendar,
  Clock,
  Users,
  MapPin,
  Edit,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  User as UserIcon,
  Phone,
  Monitor,
  Layers,
} from 'lucide-react';
import { officeBookingService, Office, MeetingBooking, BookingSummary, CalendarEvent } from '../../services/officeBookingService';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import TRAXCIS_COLORS from '../../theme/traxcis';
import KPICard from '../../components/shared/KPICard';
import CalendarView from '../../components/OfficeBooking/CalendarView';

interface User {
  id: number;
  email: string;
  full_name: string;
}

const OfficeBookingPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  // State management
  const [activeTab, setActiveTab] = useState<'offices' | 'bookings' | 'calendar'>('offices');
  const [offices, setOffices] = useState<Office[]>([]);
  const [bookings, setBookings] = useState<MeetingBooking[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [summary, setSummary] = useState<BookingSummary | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  // Modal states
  const [showOfficeModal, setShowOfficeModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [editingBooking, setEditingBooking] = useState<MeetingBooking | null>(null);

  // Form states
  const [officeForm, setOfficeForm] = useState({
    name: '',
    location: '',
    floor: '',
    capacity: 6,
    description: '',
    amenities: [] as string[],
  });

  const [bookingForm, setBookingForm] = useState({
    office_id: 0,
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    participant_ids: [] as number[],
  });

  // Dark mode detection
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

  // Load data
  useEffect(() => {
    loadData();
    if (isAdmin) {
      loadUsers();
    }
  }, []);

  // Load calendar events when switching to calendar tab
  useEffect(() => {
    if (activeTab === 'calendar') {
      loadCalendarEvents();
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [officesData, bookingsData, summaryData] = await Promise.all([
        officeBookingService.getAllOffices(),
        officeBookingService.getBookings(),
        officeBookingService.getSummary(),
      ]);
      setOffices(officesData);
      setBookings(bookingsData);
      setSummary(summaryData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load data');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadCalendarEvents = async () => {
    try {
      // Load events for next 3 months
      const startDate = new Date();
      startDate.setDate(1); // First day of current month
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3); // 3 months ahead
      
      const events = await officeBookingService.getCalendarEvents(
        startDate.toISOString(),
        endDate.toISOString()
      );
      setCalendarEvents(events);
    } catch (err: any) {
      console.error('Failed to load calendar events:', err);
      toast.error('Failed to load calendar events');
    }
  };

  const loadUsers = async () => {
    try {
      const users = await adminService.getAllUsers();
      setAllUsers(users);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  // Office operations
  const handleCreateOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await officeBookingService.createOffice(officeForm);
      toast.success('Office created successfully!');
      setShowOfficeModal(false);
      resetOfficeForm();
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create office');
    }
  };

  const handleUpdateOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffice) return;
    
    try {
      await officeBookingService.updateOffice(editingOffice.id, officeForm);
      toast.success('Office updated successfully!');
      setShowOfficeModal(false);
      setEditingOffice(null);
      resetOfficeForm();
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update office');
    }
  };

  const handleDeleteOffice = async (officeId: number) => {
    if (!window.confirm('Are you sure you want to delete this office?')) return;
    
    try {
      await officeBookingService.deleteOffice(officeId);
      toast.success('Office deleted successfully!');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to delete office');
    }
  };

  // Booking operations
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingForm.office_id) {
      toast.error('Please select an office');
      return;
    }
    
    try {
      await officeBookingService.createBooking(bookingForm);
      toast.success('Meeting booked successfully!');
      setShowBookingModal(false);
      resetBookingForm();
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to book meeting');
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm('Are you sure you want to cancel this meeting?')) return;
    
    try {
      await officeBookingService.cancelBooking(bookingId);
      toast.success('Meeting cancelled successfully!');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to cancel meeting');
    }
  };

  // Form reset functions
  const resetOfficeForm = () => {
    setOfficeForm({
      name: '',
      location: '',
      floor: '',
      capacity: 6,
      description: '',
      amenities: [],
    });
  };

  const resetBookingForm = () => {
    setBookingForm({
      office_id: 0,
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      participant_ids: [],
    });
  };

  const openEditOffice = (office: Office) => {
    setEditingOffice(office);
    setOfficeForm({
      name: office.name,
      location: office.location || '',
      floor: office.floor || '',
      capacity: office.capacity,
      description: office.description || '',
      amenities: office.amenities || [],
    });
    setShowOfficeModal(true);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      upcoming: { bg: '#DBEAFE', text: '#1E40AF', label: 'Upcoming' },
      ongoing: { bg: '#D1FAE5', text: '#065F46', label: 'Ongoing' },
      completed: { bg: '#F3F4F6', text: '#4B5563', label: 'Completed' },
      cancelled: { bg: '#FEE2E2', text: '#991B1B', label: 'Cancelled' },
    };
    return badges[status as keyof typeof badges] || badges.upcoming;
  };

  // Theme colors
  const cardBg = isDark ? TRAXCIS_COLORS.secondary[900] : '#FFFFFF';
  const cardBorder = isDark ? TRAXCIS_COLORS.secondary[700] : TRAXCIS_COLORS.secondary[200];
  const textColor = isDark ? TRAXCIS_COLORS.secondary[100] : TRAXCIS_COLORS.secondary.DEFAULT;
  const subTextColor = isDark ? TRAXCIS_COLORS.secondary[400] : TRAXCIS_COLORS.secondary[500];
  const tableHeaderBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50];
  const tableRowHoverBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50];
  const inputBg = isDark ? TRAXCIS_COLORS.secondary[800] : TRAXCIS_COLORS.secondary[50];
  const inputBorder = isDark ? TRAXCIS_COLORS.secondary[600] : TRAXCIS_COLORS.secondary[300];
  const modalOverlayBg = isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)';

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div 
              style={{
                width: '48px',
                height: '48px',
                borderRight: `3px solid ${cardBorder}`,
                borderBottom: `3px solid ${cardBorder}`,
                borderLeft: `3px solid ${cardBorder}`,
                borderTop: `3px solid ${TRAXCIS_COLORS.primary.DEFAULT}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px',
              }}
            />
            <p style={{ color: subTextColor, fontSize: '14px' }}>Loading office booking data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "'Inter', 'Outfit', sans-serif" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 
            className="text-2xl font-semibold flex items-center gap-2"
            style={{ color: textColor }}
          >
            <Building2 className="w-7 h-7" style={{ color: TRAXCIS_COLORS.primary.DEFAULT }} />
            Office Booking & Meeting Scheduler
          </h1>
          <p style={{ color: subTextColor }} className="text-sm mt-1">
            Manage office spaces and schedule meetings seamlessly
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEditingOffice(null);
                resetOfficeForm();
                setShowOfficeModal(true);
              }}
              style={{ backgroundColor: TRAXCIS_COLORS.primary.DEFAULT }}
              className="px-4 py-2 text-white rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm hover:opacity-90 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Office
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              resetBookingForm();
              setShowBookingModal(true);
            }}
            style={{ backgroundColor: TRAXCIS_COLORS.status.success }}
            className="px-4 py-2 text-white rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm hover:opacity-90 transition-all"
          >
            <Calendar className="w-4 h-4" />
            Book Meeting
          </motion.button>
        </div>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <span style={{ color: isDark ? '#FCA5A5' : '#991B1B' }} className="text-sm">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard name="Total Offices" value={summary.total_offices} icon={Building2} color="primary" />
          <KPICard name="Available Now" value={summary.available_offices} icon={CheckCircle} color="green" />
          <KPICard name="Currently Booked" value={summary.booked_offices} icon={Clock} color="yellow" />
          <KPICard name="My Meetings" value={summary.my_upcoming_meetings} icon={UserIcon} color="accent" />
        </div>
      )}

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ backgroundColor: cardBg, borderColor: cardBorder }}
        className="border rounded-xl p-1 inline-flex gap-1"
      >
        {(['offices', 'bookings', 'calendar'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor: activeTab === tab ? TRAXCIS_COLORS.primary.DEFAULT : 'transparent',
              color: activeTab === tab ? '#FFFFFF' : textColor,
            }}
            className="px-6 py-2 rounded-lg font-medium text-sm transition-all capitalize"
          >
            {tab}
          </button>
        ))}
      </motion.div>

      {/* Offices Tab */}
      {activeTab === 'offices' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ backgroundColor: cardBg, borderColor: cardBorder }}
          className="border rounded-xl shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ borderColor: cardBorder }}>
              <thead style={{ backgroundColor: tableHeaderBg }}>
                <tr>
                  <th style={{ color: subTextColor }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Office
                  </th>
                  <th style={{ color: subTextColor }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Location
                  </th>
                  <th style={{ color: subTextColor }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Capacity
                  </th>
                  <th style={{ color: subTextColor }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Amenities
                  </th>
                  <th style={{ color: subTextColor }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Status
                  </th>
                  {isAdmin && (
                    <th style={{ color: subTextColor }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: cardBorder }}>
                {offices.map((office) => (
                  <tr key={office.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${TRAXCIS_COLORS.primary.DEFAULT}15` }}
                        >
                          <Building2 className="w-5 h-5" style={{ color: TRAXCIS_COLORS.primary.DEFAULT }} />
                        </div>
                        <div>
                          <p style={{ color: textColor }} className="text-sm font-semibold">{office.name}</p>
                          {office.description && (
                            <p style={{ color: subTextColor }} className="text-xs mt-0.5">
                              {office.description.substring(0, 50)}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p style={{ color: textColor }} className="text-sm">
                        {office.location || '-'}
                      </p>
                      {office.floor && (
                        <p style={{ color: subTextColor }} className="text-xs">{office.floor}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" style={{ color: subTextColor }} />
                        <span style={{ color: textColor }} className="text-sm font-medium">
                          {office.capacity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(office.amenities || []).slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                          >
                            {amenity}
                          </span>
                        ))}
                        {(office.amenities || []).length > 3 && (
                          <span style={{ color: subTextColor }} className="text-xs">
                            +{(office.amenities || []).length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {office.current_booking ? (
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs rounded-full font-semibold">
                          Booked
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full font-semibold">
                          Available
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditOffice(office)}
                            style={{ color: TRAXCIS_COLORS.primary.DEFAULT }}
                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOffice(office.id)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ backgroundColor: cardBg, borderColor: cardBorder }}
          className="border rounded-xl shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ borderColor: cardBorder }}>
              <thead style={{ backgroundColor: tableHeaderBg }}>
                <tr>
                  <th style={{ color: subTextColor }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Meeting
                  </th>
                  <th style={{ color: subTextColor }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Office
                  </th>
                  <th style={{ color: subTextColor }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Organizer
                  </th>
                  <th style={{ color: subTextColor }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th style={{ color: subTextColor }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Duration
                  </th>
                  <th style={{ color: subTextColor }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Participants
                  </th>
                  <th style={{ color: subTextColor }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Status
                  </th>
                  <th style={{ color: subTextColor }} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: cardBorder }}>
                {bookings.map((booking) => {
                  const badge = getStatusBadge(booking.status);
                  const startDate = new Date(booking.start_time);
                  const canCancel = booking.organizer_id === currentUser?.id || isAdmin;
                  
                  return (
                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <p style={{ color: textColor }} className="text-sm font-semibold">{booking.title}</p>
                        {booking.description && (
                          <p style={{ color: subTextColor }} className="text-xs mt-0.5">
                            {booking.description.substring(0, 50)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p style={{ color: textColor }} className="text-sm">{booking.office_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p style={{ color: textColor }} className="text-sm">{booking.organizer_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p style={{ color: textColor }} className="text-sm">
                          {startDate.toLocaleDateString()}
                        </p>
                        <p style={{ color: subTextColor }} className="text-xs">
                          {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p style={{ color: textColor }} className="text-sm">{booking.duration_minutes} min</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" style={{ color: subTextColor }} />
                          <span style={{ color: textColor }} className="text-sm">
                            {booking.participant_names.length}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          style={{ backgroundColor: badge.bg, color: badge.text }}
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {canCancel && booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CalendarView
            events={calendarEvents}
            isDark={isDark}
            onEventClick={(event) => {
              // Could open detailed view or booking modal
              console.log('Event clicked:', event);
            }}
            onSelectSlot={(slotInfo) => {
              // Auto-fill booking form with selected time
              const startTime = new Date(slotInfo.start);
              const endTime = new Date(slotInfo.end);
              
              setBookingForm({
                ...bookingForm,
                start_time: startTime.toISOString().slice(0, 16),
                end_time: endTime.toISOString().slice(0, 16),
              });
              setShowBookingModal(true);
            }}
          />
        </motion.div>
      )}

      {/* Add/Edit Office Modal */}
      <AnimatePresence>
        {showOfficeModal && (
          <div
            style={{ backgroundColor: modalOverlayBg }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowOfficeModal(false);
              setEditingOffice(null);
              resetOfficeForm();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: cardBg }}
              className="rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl"
            >
              <h2 style={{ color: textColor }} className="text-xl font-semibold mb-6">
                {editingOffice ? 'Edit Office' : 'Add New Office'}
              </h2>

              <form onSubmit={editingOffice ? handleUpdateOffice : handleCreateOffice} className="space-y-4">
                <div>
                  <label style={{ color: textColor }} className="block text-sm font-medium mb-2">
                    Office Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={officeForm.name}
                    onChange={(e) => setOfficeForm({ ...officeForm, name: e.target.value })}
                    style={{ 
                      backgroundColor: inputBg,
                      borderColor: inputBorder,
                      color: textColor,
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Conference Room A"
                  />
                </div>

                <div>
                  <label style={{ color: textColor }} className="block text-sm font-medium mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={officeForm.location}
                    onChange={(e) => setOfficeForm({ ...officeForm, location: e.target.value })}
                    style={{ 
                      backgroundColor: inputBg,
                      borderColor: inputBorder,
                      color: textColor,
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Main Building"
                  />
                </div>

                <div>
                  <label style={{ color: textColor }} className="block text-sm font-medium mb-2">
                    Floor
                  </label>
                  <input
                    type="text"
                    value={officeForm.floor}
                    onChange={(e) => setOfficeForm({ ...officeForm, floor: e.target.value })}
                    style={{ 
                      backgroundColor: inputBg,
                      borderColor: inputBorder,
                      color: textColor,
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Floor 2"
                  />
                </div>

                <div>
                  <label style={{ color: textColor }} className="block text-sm font-medium mb-2">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={officeForm.capacity}
                    onChange={(e) => setOfficeForm({ ...officeForm, capacity: parseInt(e.target.value) })}
                    style={{ 
                      backgroundColor: inputBg,
                      borderColor: inputBorder,
                      color: textColor,
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label style={{ color: textColor }} className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={officeForm.description}
                    onChange={(e) => setOfficeForm({ ...officeForm, description: e.target.value })}
                    style={{ 
                      backgroundColor: inputBg,
                      borderColor: inputBorder,
                      color: textColor,
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Brief description of the office..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOfficeModal(false);
                      setEditingOffice(null);
                      resetOfficeForm();
                    }}
                    style={{ borderColor: cardBorder, color: textColor }}
                    className="flex-1 px-4 py-2 border rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ backgroundColor: TRAXCIS_COLORS.primary.DEFAULT }}
                    className="flex-1 px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    {editingOffice ? 'Update Office' : 'Create Office'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Book Meeting Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <div
            style={{ backgroundColor: modalOverlayBg }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowBookingModal(false);
              resetBookingForm();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: cardBg }}
              className="rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl"
            >
              <h2 style={{ color: textColor }} className="text-xl font-semibold mb-6">
                Book a Meeting
              </h2>

              <form onSubmit={handleCreateBooking} className="space-y-4">
                <div>
                  <label style={{ color: textColor }} className="block text-sm font-medium mb-2">
                    Meeting Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.title}
                    onChange={(e) => setBookingForm({ ...bookingForm, title: e.target.value })}
                    style={{ 
                      backgroundColor: inputBg,
                      borderColor: inputBorder,
                      color: textColor,
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Weekly Team Sync"
                  />
                </div>

                <div>
                  <label style={{ color: textColor }} className="block text-sm font-medium mb-2">
                    Select Office *
                  </label>
                  <select
                    required
                    value={bookingForm.office_id}
                    onChange={(e) => setBookingForm({ ...bookingForm, office_id: parseInt(e.target.value) })}
                    style={{ 
                      backgroundColor: inputBg,
                      borderColor: inputBorder,
                      color: textColor,
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Choose an office...</option>
                    {offices.filter(o => o.is_active).map((office) => (
                      <option key={office.id} value={office.id}>
                        {office.name} (Capacity: {office.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={{ color: textColor }} className="block text-sm font-medium mb-2">
                      Start Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={bookingForm.start_time}
                      onChange={(e) => setBookingForm({ ...bookingForm, start_time: e.target.value })}
                      style={{ 
                        backgroundColor: inputBg,
                        borderColor: inputBorder,
                        color: textColor,
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label style={{ color: textColor }} className="block text-sm font-medium mb-2">
                      End Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={bookingForm.end_time}
                      onChange={(e) => setBookingForm({ ...bookingForm, end_time: e.target.value })}
                      style={{ 
                        backgroundColor: inputBg,
                        borderColor: inputBorder,
                        color: textColor,
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label style={{ color: textColor }} className="block text-sm font-medium">
                      Invite Participants
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const allUserIds = allUsers.map(u => u.id).filter(id => id !== currentUser?.id);
                        setBookingForm({ 
                          ...bookingForm, 
                          participant_ids: bookingForm.participant_ids.length === allUserIds.length ? [] : allUserIds 
                        });
                      }}
                      style={{ color: TRAXCIS_COLORS.primary.DEFAULT }}
                      className="text-xs font-medium hover:underline"
                    >
                      {bookingForm.participant_ids.length === allUsers.filter(u => u.id !== currentUser?.id).length ? 'Clear All' : 'Invite All'}
                    </button>
                  </div>
                  <div 
                    style={{ 
                      backgroundColor: inputBg,
                      borderColor: inputBorder,
                    }}
                    className="border rounded-lg max-h-60 overflow-y-auto"
                  >
                    {allUsers.filter(u => u.id !== currentUser?.id).map((user) => (
                      <label
                        key={user.id}
                        className="flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors border-b last:border-b-0"
                        style={{ borderColor: cardBorder }}
                      >
                        <input
                          type="checkbox"
                          checked={bookingForm.participant_ids.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBookingForm({
                                ...bookingForm,
                                participant_ids: [...bookingForm.participant_ids, user.id]
                              });
                            } else {
                              setBookingForm({
                                ...bookingForm,
                                participant_ids: bookingForm.participant_ids.filter(id => id !== user.id)
                              });
                            }
                          }}
                          style={{ accentColor: TRAXCIS_COLORS.primary.DEFAULT }}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 mr-3"
                        />
                        <div className="flex-1">
                          <p style={{ color: textColor }} className="text-sm font-medium">
                            {user.full_name}
                          </p>
                          <p style={{ color: subTextColor }} className="text-xs">
                            {user.email}
                          </p>
                        </div>
                        <Users className="w-4 h-4" style={{ color: subTextColor }} />
                      </label>
                    ))}
                    {allUsers.filter(u => u.id !== currentUser?.id).length === 0 && (
                      <p style={{ color: subTextColor }} className="text-sm text-center py-6">
                        No other users available to invite
                      </p>
                    )}
                  </div>
                  <p style={{ color: subTextColor }} className="text-xs mt-2">
                    {bookingForm.participant_ids.length} participant{bookingForm.participant_ids.length !== 1 ? 's' : ''} selected
                  </p>
                </div>

                <div>
                  <label style={{ color: textColor }} className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={bookingForm.description}
                    onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                    style={{ 
                      backgroundColor: inputBg,
                      borderColor: inputBorder,
                      color: textColor,
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Meeting agenda or description..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBookingModal(false);
                      resetBookingForm();
                    }}
                    style={{ borderColor: cardBorder, color: textColor }}
                    className="flex-1 px-4 py-2 border rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ backgroundColor: TRAXCIS_COLORS.status.success }}
                    className="flex-1 px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Book Meeting
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OfficeBookingPage;

