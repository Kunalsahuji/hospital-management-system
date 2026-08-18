import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { Search, MapPin, Clock, Calendar, Star, X, Loader2, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import { DoctorCardSkeleton } from '../components/Skeletons';

const DoctorsList = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  // Booking modal state
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [reason, setReason] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  // Disable background scrolling when modal is open
  useEffect(() => {
    if (selectedDoctor) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedDoctor]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get('/users/doctors');
        if (data.success) {
          setDoctors(data.data);
        }
      } catch (error) {
        toast.error('Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'exp-desc') return (b.experience || 0) - (a.experience || 0);
    if (sortBy === 'fee-asc') return (a.consultationFee || 0) - (b.consultationFee || 0);
    return 0;
  });

  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleBook = async (e) => {
    e.preventDefault();
    setIsBooking(true);
    try {
      const { data } = await axios.post('/appointments', {
        doctor: selectedDoctor._id,
        appointmentDate: bookingDate,
        appointmentTime: bookingTime,
        reason: reason || 'General checkup'
      });
      if (data.success) {
        toast.success('Appointment booked successfully!');
        setSelectedDoctor(null);
        setBookingDate('');
        setBookingTime('');
        setReason('');
        navigate('/patient/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setIsBooking(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-24">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Find a Specialist</h1>
          <p className="text-gray-500 mt-1">Book an appointment with top-rated doctors.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50 text-gray-900 transition-colors"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SlidersHorizontal className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50 text-gray-900 appearance-none"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="exp-desc">Experience (High-Low)</option>
              <option value="fee-asc">Fee (Low-High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <DoctorCardSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {paginatedDoctors.map(doctor => (
            <motion.div 
              key={doctor._id}
              variants={cardVariants}
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 group"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
                    {doctor.name?.replace(/^Dr\.?\s+/i, '').charAt(0)}
                  </div>
                  <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-sm">
                    <Star className="w-3 h-3 mr-1 fill-current" /> New
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {doctor.name?.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`}
                </h3>
                <p className="text-teal-600 font-medium text-sm mb-4">{doctor.specialization || 'General Physician'}</p>
                
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{doctor.hospital || 'CareConnect Clinic'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{doctor.experience || 0} years experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 text-gray-400 font-bold flex items-center justify-center">₹</span>
                    <span>{doctor.consultationFee || 500} per consultation</span>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedDoctor(doctor)}
                  className="w-full bg-gray-50 text-teal-600 font-semibold py-3 rounded-xl group-hover:bg-teal-600 group-hover:text-white transition-colors"
                >
                  Book Appointment
                </button>
              </div>
            </motion.div>
          ))}
          
          {paginatedDoctors.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No doctors found matching your criteria.
            </div>
          )}
        </motion.div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 pb-12 sm:pt-20 sm:pb-20">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDoctor(null)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80dvh]"
            >
              <div className="bg-gradient-to-r from-teal-500 to-teal-700 p-6 text-white flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-xl font-bold">Book Appointment</h3>
                  <p className="text-teal-100 text-sm opacity-90 mt-1">
                    with {selectedDoctor.name?.startsWith('Dr.') ? selectedDoctor.name : `Dr. ${selectedDoctor.name}`}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedDoctor(null)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleBook} className="p-6 space-y-5 overflow-y-auto">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Select Date <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input 
                      type="date" 
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Select Time <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input 
                      type="time" 
                      required
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50 text-gray-900"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Doctor is available between {selectedDoctor.availableFrom || '09:00'} and {selectedDoctor.availableTo || '17:00'}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Reason for Visit</label>
                  <textarea 
                    rows="3"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Briefly describe your symptoms or reason for visit..."
                    className="block w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-gray-50 text-gray-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isBooking}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-all"
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                      Confirming...
                    </>
                  ) : (
                    'Confirm Appointment'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorsList;
