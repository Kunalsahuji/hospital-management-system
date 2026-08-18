import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { Calendar, Clock, User as UserIcon, CheckCircle, XCircle, Activity, Award, Loader2, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../components/Skeletons';

const DoctorDashboard = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const activeTab = tab || 'schedule';

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
    specialization: user?.specialization || '',
    qualification: user?.qualification || '',
    experience: user?.experience || '',
    consultationFee: user?.consultationFee || '',
    hospital: user?.hospital || '',
    bio: user?.bio || '',
    availableFrom: user?.availableFrom || '',
    availableTo: user?.availableTo || ''
  });
  
  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, appointmentId: null, action: null });

  // Disable background scrolling when modal is open
  useEffect(() => {
    if (confirmModal.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [confirmModal.isOpen]);

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
    if (['date-desc', 'date-asc', 'patient'].includes(filterSort)) return true;
    return apt.status === filterSort;
  });

  const sortedAppointments = [...filteredByStatus].sort((a, b) => {
    if (filterSort === 'date-asc') return new Date(a.appointmentDate) - new Date(b.appointmentDate);
    if (filterSort === 'patient') return a.patient.name.localeCompare(b.patient.name);
    return new Date(b.appointmentDate) - new Date(a.appointmentDate);
  });

  const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
  const paginatedAppointments = sortedAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleActionRequest = (id, action) => {
    if (action === 'confirmed') {
      executeStatusUpdate(id, action);
    } else {
      setConfirmModal({ isOpen: true, appointmentId: id, action });
    }
  };

  const executeStatusUpdate = async (id, status) => {
    try {
      const { data } = await axios.patch(`/appointments/${id}/status`, { status });
      if (data.success) {
        toast.success(`Appointment ${status}`);
        setConfirmModal({ isOpen: false, appointmentId: null, action: null });
        fetchAppointments(); // refresh
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

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
      <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between relative overflow-hidden border border-slate-100">
        {/* Background decorative blobs */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-50 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
          <div className="w-20 h-20 shrink-0 bg-gradient-to-br from-teal-50 to-emerald-100 rounded-2xl flex items-center justify-center text-3xl font-bold text-teal-600 shadow-sm border border-teal-100">
            {user?.name?.replace(/^Dr\.?\s+/i, '').charAt(0) || 'D'}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
              {user?.name?.startsWith('Dr.') ? user.name : `Dr. ${user?.name}`}
            </h1>
            <p className="text-slate-600 font-medium text-sm md:text-base flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full border border-teal-100 flex items-center gap-1">
                <Activity size={14} className="text-teal-600" />
                {user?.specialization || 'General Practitioner'}
              </span>
              <span className="hidden md:inline text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-500">
                {user?.hospital || 'Independent Clinic'}
              </span>
            </p>
          </div>
        </div>
        
        <div className="mt-8 md:mt-0 relative z-10 flex gap-2 sm:gap-4 text-sm bg-slate-50 border border-slate-100 px-4 sm:px-6 py-4 rounded-2xl shadow-sm w-full md:w-auto justify-center">
          <div className="text-center px-2 sm:px-4">
            <span className="block text-slate-500 mb-1 text-[10px] sm:text-xs uppercase tracking-wider font-semibold">Consultation</span>
            <span className="text-xl sm:text-2xl font-bold text-teal-600">₹{user?.consultationFee || '500'}</span>
          </div>
          <div className="w-px bg-slate-200"></div>
          <div className="text-center px-2 sm:px-4">
            <span className="block text-slate-500 mb-1 text-[10px] sm:text-xs uppercase tracking-wider font-semibold">Experience</span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-600 flex items-baseline justify-center gap-1">
              {user?.experience || '0'} <span className="text-[10px] sm:text-xs font-medium uppercase tracking-widest opacity-80">yrs</span>
            </span>
          </div>
        </div>
      </motion.div>



      <AnimatePresence mode="wait">
        {activeTab === 'schedule' ? (
          <motion.div key="appointments" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 whitespace-nowrap">Patient Appointments</h2>
            <div className="bg-teal-50 text-teal-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border border-teal-100 whitespace-nowrap shrink-0">
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
                <option value="patient">All: Patient Name</option>
                <option value="scheduled">Status: Scheduled</option>
                <option value="confirmed">Status: Confirmed</option>
                <option value="completed">Status: Completed</option>
                <option value="cancelled">Status: Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <TableSkeleton />
        ) : appointments.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
            <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-lg text-slate-500 font-medium">Your schedule is clear!</p>
            <p className="text-sm text-slate-400 mt-1">No appointments scheduled yet.</p>
          </div>
        ) : sortedAppointments.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
            <Activity className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-lg text-slate-500 font-medium">No appointments found for this filter.</p>
            <button onClick={() => setFilterSort('date-desc')} className="text-teal-600 font-semibold hover:underline mt-2 inline-block">Clear filter</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] sm:text-xs uppercase tracking-widest">
                  <th className="p-3 sm:p-5 font-semibold rounded-tl-xl">Patient Details</th>
                  <th className="p-3 sm:p-5 font-semibold">Date & Time</th>
                  <th className="p-3 sm:p-5 font-semibold hidden md:table-cell">Reason</th>
                  <th className="p-3 sm:p-5 font-semibold">Status</th>
                  <th className="p-3 sm:p-5 font-semibold rounded-tr-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedAppointments.map(apt => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={apt._id} 
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="p-3 sm:p-5">
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                          {apt.patient.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm sm:text-base">{apt.patient.name}</p>
                          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{apt.patient.phone || 'No phone provided'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 sm:p-5">
                      <div className="text-xs sm:text-sm font-semibold text-slate-800">{new Date(apt.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                      <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <Clock size={12} /> {apt.appointmentTime}
                      </div>
                    </td>
                    <td className="p-3 sm:p-5 text-xs sm:text-sm text-slate-600 max-w-[150px] truncate hidden md:table-cell" title={apt.reason}>
                      {apt.reason || 'General checkup'}
                    </td>
                    <td className="p-3 sm:p-5">
                      <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                        apt.status === 'scheduled' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        apt.status === 'completed' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                        'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="p-5">
                      {apt.status === 'scheduled' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleActionRequest(apt._id, 'confirmed')} className="text-emerald-600 hover:text-white bg-emerald-50 hover:bg-emerald-500 p-2 rounded-lg transition-all shadow-sm" title="Confirm">
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleActionRequest(apt._id, 'cancelled')} className="text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-500 p-2 rounded-lg transition-all shadow-sm" title="Cancel">
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                      {apt.status === 'confirmed' && (
                        <button onClick={() => handleActionRequest(apt._id, 'completed')} className="text-xs font-bold uppercase tracking-wider bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors shadow-md">
                          Mark Done
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
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
            <div className="max-w-3xl mx-auto">
              <div className="mb-8 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-slate-900">Profile Settings</h2>
                <p className="text-slate-500 mt-1">Update your professional information.</p>
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
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Specialization</label>
                  <input type="text" value={profileData.specialization} onChange={(e) => setProfileData({...profileData, specialization: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Qualification</label>
                  <input type="text" value={profileData.qualification} onChange={(e) => setProfileData({...profileData, qualification: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Experience (Years)</label>
                  <input type="number" min="0" value={profileData.experience} onChange={(e) => setProfileData({...profileData, experience: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Consultation Fee (₹)</label>
                  <input type="number" min="0" value={profileData.consultationFee} onChange={(e) => setProfileData({...profileData, consultationFee: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-colors" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Hospital / Clinic</label>
                  <input type="text" value={profileData.hospital} onChange={(e) => setProfileData({...profileData, hospital: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Available From</label>
                  <input type="time" value={profileData.availableFrom} onChange={(e) => setProfileData({...profileData, availableFrom: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Available To</label>
                  <input type="time" value={profileData.availableTo} onChange={(e) => setProfileData({...profileData, availableTo: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-colors" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Bio</label>
                  <textarea rows="3" value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-colors"></textarea>
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

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-32 bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-6 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmModal.action === 'cancelled' ? 'bg-rose-100 text-rose-600' : 'bg-teal-100 text-teal-600'}`}>
                {confirmModal.action === 'cancelled' ? <XCircle className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {confirmModal.action === 'cancelled' ? 'Cancel Appointment?' : 'Mark as Completed?'}
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                {confirmModal.action === 'cancelled' 
                  ? 'Are you sure you want to cancel this appointment? This action cannot be undone.' 
                  : 'Are you sure you want to mark this appointment as completed?'}
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal({ isOpen: false, appointmentId: null, action: null })}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={() => executeStatusUpdate(confirmModal.appointmentId, confirmModal.action)}
                  className={`flex-1 px-4 py-3 text-white font-semibold rounded-xl transition-colors ${
                    confirmModal.action === 'cancelled' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-teal-600 hover:bg-teal-700'
                  }`}
                >
                  {confirmModal.action === 'cancelled' ? 'Yes, Cancel' : 'Yes, Complete'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default DoctorDashboard;
