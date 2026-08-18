import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axios';
import { Calendar, Clock, User as UserIcon, XCircle, RefreshCw, Activity, X, Loader2, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { AppointmentCardSkeleton } from '../components/Skeletons';

const PatientDashboard = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || 'appointments';

  const { user, updateProfile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSort, setFilterSort] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(window.innerWidth < 640 ? 4 : 6);

  useEffect(() => {
    const handleResize = () => setItemsPerPage(window.innerWidth < 640 ? 4 : 6);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);
  
  // Profile State
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone ? user.phone.replace(/^\+91/, '') : '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    gender: user?.gender || '',
    address: user?.address || ''
  });
  
  // Modal States
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, appointmentId: null });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
  const [rescheduling, setRescheduling] = useState(false);

  // Disable background scrolling when any modal is open
  useEffect(() => {
    if (isRescheduleModalOpen || confirmModal.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isRescheduleModalOpen, confirmModal.isOpen]);

  const fetchAppointments = async () => {
    try {
      const { data } = await axios.get('/appointments');
      if (data.success) {
        setAppointments(data.data);
      }
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterSort]);

  const filteredByStatus = appointments.filter(apt => {
    if (['date-desc', 'date-asc'].includes(filterSort)) return true;
    return apt.status === filterSort;
  });

  const sortedAppointments = [...filteredByStatus].sort((a, b) => {
    if (filterSort === 'date-asc') return new Date(a.appointmentDate) - new Date(b.appointmentDate);
    return new Date(b.appointmentDate) - new Date(a.appointmentDate);
  });

  const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
  const paginatedAppointments = sortedAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCancelRequest = (id) => {
    setConfirmModal({ isOpen: true, appointmentId: id });
  };

  const confirmCancel = async () => {
    try {
      const { data } = await axios.patch(`/appointments/${confirmModal.appointmentId}/cancel`);
      if (data.success) {
        toast.success('Appointment cancelled successfully');
        setConfirmModal({ isOpen: false, appointmentId: null });
        fetchAppointments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const openRescheduleModal = (apt) => {
    setSelectedAppointment(apt);
    setRescheduleData({
      date: apt.appointmentDate.split('T')[0],
      time: apt.appointmentTime
    });
    setIsRescheduleModalOpen(true);
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleData.date || !rescheduleData.time) {
      toast.error('Please select both date and time');
      return;
    }

    setRescheduling(true);
    try {
      const { data } = await axios.patch(`/appointments/${selectedAppointment._id}/reschedule`, {
        appointmentDate: rescheduleData.date,
        appointmentTime: rescheduleData.time
      });
      if (data.success) {
        toast.success('Appointment rescheduled! Waiting for doctor confirmation.');
        setIsRescheduleModalOpen(false);
        fetchAppointments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reschedule appointment');
    } finally {
      setRescheduling(false);
    }
  };

  // Generate time slots 09:00 to 17:00
  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hours = Math.floor(i / 2) + 9;
    const mins = i % 2 === 0 ? '00' : '30';
    return `${hours.toString().padStart(2, '0')}:${mins}`;
  });

  // Framer motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    
    const payload = { ...profileData };
    if (payload.phone && !payload.phone.startsWith('+91')) {
      payload.phone = '+91' + payload.phone;
    }

    const success = await updateProfile(payload);
    if (success) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setUpdatingProfile(false);
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 pb-24"
    >
      {/* Premium Profile Banner */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl shadow-lg p-6 sm:p-10 text-white flex flex-col md:flex-row md:items-center justify-between relative overflow-hidden">
        {/* Background decorative blobs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-300 opacity-20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 md:mb-0 text-center sm:text-left">
          <div className="w-20 h-20 shrink-0 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl font-bold shadow-sm border border-white/30">
            {user?.name?.charAt(0) || 'P'}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Welcome, {user?.name}</h1>
            <p className="text-teal-100 font-medium text-sm md:text-base flex items-center justify-center sm:justify-start gap-2">
              <Activity size={16} /> Manage your appointments and health records.
            </p>
          </div>
        </div>
        
        <div className="relative z-10">
          <Link 
            to="/doctors" 
            className="group flex items-center justify-center px-6 py-3 bg-white text-teal-700 font-bold rounded-xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all w-full sm:w-auto"
          >
            <Calendar className="mr-2 group-hover:rotate-12 transition-transform" size={20} />
            Book New Appointment
          </Link>
        </div>
      </motion.div>



      <AnimatePresence mode="wait">
        {activeTab === 'appointments' ? (
          <motion.div key="appointments" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Your Appointments</h2>
            <div className="bg-slate-50 text-slate-600 px-4 py-1.5 rounded-full text-sm font-semibold border border-slate-200 inline-block mt-2">
              {appointments.length} Total
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-56 shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SlidersHorizontal className="h-5 w-5 text-slate-400" />
              </div>
              <select
                value={filterSort}
                onChange={(e) => setFilterSort(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 text-slate-700 font-medium appearance-none"
              >
                <option value="date-desc">All: Date (Newest)</option>
                <option value="date-asc">All: Date (Oldest)</option>
                <option value="scheduled">Status: Scheduled</option>
                <option value="confirmed">Status: Confirmed</option>
                <option value="completed">Status: Completed</option>
                <option value="cancelled">Status: Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => <AppointmentCardSkeleton key={i} />)}
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
            <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-lg text-slate-600 font-medium">You have no appointments yet.</p>
            <Link to="/doctors" className="text-teal-600 font-semibold hover:underline mt-2 inline-block">Find a doctor and book one now</Link>
          </div>
        ) : sortedAppointments.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
            <Activity className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-lg text-slate-600 font-medium">No appointments found for this filter.</p>
            <button onClick={() => setFilterSort('date-desc')} className="text-teal-600 font-semibold hover:underline mt-2 inline-block">Clear filter</button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedAppointments.map(apt => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={apt._id} 
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group flex flex-col"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center font-bold text-xl">
                      {apt.doctor.name?.replace(/^Dr\.?\s+/i, '').charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 leading-tight">
                        {apt.doctor.name?.startsWith('Dr.') ? apt.doctor.name : `Dr. ${apt.doctor.name}`}
                      </h3>
                      <p className="text-xs font-medium text-teal-600 mt-1">{apt.doctor.specialization}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100 flex-grow">
                  <div className="flex items-center text-sm font-medium text-slate-700">
                    <Calendar className="w-4 h-4 mr-3 text-slate-400" />
                    {new Date(apt.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="flex items-center text-sm font-medium text-slate-700">
                    <Clock className="w-4 h-4 mr-3 text-slate-400" />
                    {apt.appointmentTime}
                  </div>
                  <div className="flex items-start text-sm text-slate-600 pt-2 border-t border-slate-200 mt-2">
                    <span className="font-medium text-slate-400 w-16">Reason:</span>
                    <span className="flex-1 line-clamp-2">{apt.reason || 'General checkup'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    apt.status === 'scheduled' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                    apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                    apt.status === 'completed' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                    'bg-rose-100 text-rose-700 border border-rose-200'
                  }`}>
                    {apt.status}
                  </span>

                  {/* Actions for active appointments */}
                  {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openRescheduleModal(apt)}
                        className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Reschedule Appointment"
                      >
                        <RefreshCw size={18} />
                      </button>
                      <button 
                        onClick={() => handleCancelRequest(apt._id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Cancel Appointment"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 sm:px-4 sm:py-2 flex items-center justify-center rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white text-slate-700 hover:bg-slate-100 shadow-sm border border-slate-200"
            >
              <ChevronLeft className="w-5 h-5 sm:mr-1" />
              <span className="hidden sm:inline">Prev</span>
            </button>
            
            <div className="flex items-center gap-1 mx-2">
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all shadow-sm ${currentPage === i + 1 ? 'bg-teal-600 text-white border border-teal-600' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 sm:px-4 sm:py-2 flex items-center justify-center rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white text-slate-700 hover:bg-slate-100 shadow-sm border border-slate-200"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-5 h-5 sm:ml-1" />
            </button>
          </div>
        )}
      </motion.div>
        ) : (
          <motion.div key="profile" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-slate-900">Profile Settings</h2>
                <p className="text-slate-500 mt-1">Update your personal information.</p>
              </div>
              
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-500 font-medium">
                      +91
                    </span>
                    <input 
                      type="text" 
                      value={profileData.phone} 
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                        setProfileData({...profileData, phone: val});
                      }} 
                      className="flex-1 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-none rounded-r-xl focus:ring-2 focus:ring-teal-500 outline-none transition-colors" 
                      required 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth</label>
                  <input type="date" value={profileData.dateOfBirth} onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
                  <select value={profileData.gender} onChange={(e) => setProfileData({...profileData, gender: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-colors" required>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                  <input type="text" value={profileData.address} onChange={(e) => setProfileData({...profileData, address: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-colors" required />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-center">
                <button type="submit" disabled={updatingProfile} className="w-full sm:w-auto px-8 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-md hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center">
                  {updatingProfile ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  {updatingProfile ? 'Saving...' : 'Save Changes'}
                </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {isRescheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 pb-12 sm:pt-20 sm:pb-20 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80dvh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                <h3 className="text-xl font-bold text-slate-900">Reschedule Appointment</h3>
                <button 
                  onClick={() => setIsRescheduleModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleReschedule} className="p-6 space-y-6 overflow-y-auto">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input 
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                      value={rescheduleData.date}
                      onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Time</label>
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                    {timeSlots.map(time => (
                      <button
                        type="button"
                        key={time}
                        onClick={() => setRescheduleData({...rescheduleData, time})}
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                          rescheduleData.time === time 
                            ? 'bg-teal-600 text-white shadow-md' 
                            : 'bg-slate-50 text-slate-600 hover:bg-teal-50 border border-slate-200'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRescheduleModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={rescheduling}
                    className="flex-1 px-4 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 flex justify-center items-center"
                  >
                    {rescheduling ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Confirm'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-32 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="text-rose-600 w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Cancel Appointment?</h3>
                <p className="text-slate-500 text-sm mb-6">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmModal({ isOpen: false, appointmentId: null })}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    No, keep it
                  </button>
                  <button
                    onClick={confirmCancel}
                    className="flex-1 px-4 py-3 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-colors"
                  >
                    Yes, cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PatientDashboard;
