import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, User as UserIcon, Loader2, Phone, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { PatientCardSkeleton } from '../components/Skeletons';

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await axios.get('/users/patients');
        if (data.success) {
          setPatients(data.data);
        }
      } catch (error) {
        toast.error('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (patient.phone && patient.phone.includes(searchTerm))
  ).sort((a, b) => {
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
    return 0;
  });

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
          <h1 className="text-3xl font-extrabold text-gray-900">Patient Directory</h1>
          <p className="text-gray-500 mt-1">View all registered patients in the system.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or phone..."
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
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <PatientCardSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {paginatedPatients.map(patient => (
            <motion.div 
              key={patient._id}
              variants={cardVariants}
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 group"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center text-2xl font-bold font-serif shadow-inner">
                    {patient.name.charAt(0)}
                  </div>
                  <div className="bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-slate-100">
                    <UserIcon className="w-3 h-3" />
                    Patient
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1">{patient.name}</h3>
                <p className="text-teal-600 font-medium text-sm mb-4">{patient.username}</p>
                
                <div className="space-y-4 text-sm text-gray-600 mb-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <a href={`tel:${patient.phone || ''}`} className="flex items-center gap-3 hover:bg-white p-2 -mx-2 -mt-2 rounded-lg transition-colors group/link">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover/link:bg-teal-50 transition-colors">
                      <Phone className="w-4 h-4 text-teal-600" />
                    </div>
                    <span className="font-medium text-slate-700 group-hover/link:text-teal-700">{patient.phone || 'Not provided'}</span>
                  </a>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(patient.address || 'India')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:bg-white p-2 -mx-2 -mb-2 rounded-lg transition-colors group/link">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm group-hover/link:bg-teal-50 transition-colors shrink-0">
                      <MapPin className="w-4 h-4 text-teal-600" />
                    </div>
                    <span className="font-medium text-slate-700 group-hover/link:text-teal-700 line-clamp-1">{patient.address || 'Address not provided'}</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
          
          {paginatedPatients.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-3xl border border-dashed border-gray-200">
              <UserIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-lg font-semibold text-gray-600">No patients found</p>
              <p className="text-sm">Try adjusting your search criteria.</p>
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
    </div>
  );
};

export default PatientsList;
