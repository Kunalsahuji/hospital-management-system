import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import { Hospital, UserPlus, LogIn, Clock, ShieldCheck, Activity, ArrowRight, HeartPulse, Stethoscope, FileText } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ patients: 0, doctors: 0, specialties: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/users/stats');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15, delayChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] overflow-hidden bg-white">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-4 pb-12 lg:pt-8 lg:pb-16 flex flex-col items-center text-center">
        {/* Background decorative blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-teal-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-[30%] right-[10%] w-72 h-72 bg-emerald-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-[30%] w-72 h-72 bg-indigo-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <motion.div 
          className="max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-teal-50 to-emerald-100 rounded-3xl mb-8 shadow-sm border border-teal-100/50">
            <HeartPulse size={48} className="text-teal-600 drop-shadow-sm" />
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
            Healthcare made <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Simple & Secure</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed font-light">
            CareConnect bridges the gap between expert medical professionals and patients. Schedule appointments, manage health records, and access care from anywhere.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            {user ? (
              <Link 
                to={user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} 
                className="group flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-2xl transition-all shadow-xl hover:shadow-teal-500/30 hover:-translate-y-1 w-full sm:w-auto"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            ) : (
              <>
                <Link 
                  to="/register" 
                  className="group flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-2xl transition-all shadow-xl hover:shadow-slate-500/30 hover:-translate-y-1 w-full sm:w-auto"
                >
                  <UserPlus className="mr-2" size={20} />
                  Join CareConnect
                </Link>
                <Link 
                  to="/login" 
                  className="group flex items-center justify-center px-8 py-4 text-lg font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-2xl transition-all shadow-sm hover:shadow-md hover:-translate-y-1 w-full sm:w-auto"
                >
                  <LogIn className="mr-2" size={20} />
                  Sign In
                </Link>
              </>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white border-t border-slate-100 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why choose CareConnect?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">We provide a premium, end-to-end digital healthcare experience designed for both patients and medical practitioners.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="bg-slate-50 p-8 rounded-3xl border border-slate-100 transition-all duration-300 hover:shadow-xl hover:bg-white group"
            >
              <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="text-teal-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Instant Scheduling</h3>
              <p className="text-slate-600 leading-relaxed">Book, view, and manage your medical appointments instantly. Skip the waiting room and reception calls completely.</p>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="bg-slate-50 p-8 rounded-3xl border border-slate-100 transition-all duration-300 hover:shadow-xl hover:bg-white group"
            >
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="text-indigo-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Enterprise Security</h3>
              <p className="text-slate-600 leading-relaxed">Your health data is highly sensitive. We protect your medical history and personal details with state-of-the-art encryption.</p>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="bg-slate-50 p-8 rounded-3xl border border-slate-100 transition-all duration-300 hover:shadow-xl hover:bg-white group"
            >
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Stethoscope className="text-emerald-600" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Top Specialists</h3>
              <p className="text-slate-600 leading-relaxed">Access a curated network of highly qualified doctors, surgeons, and physicians ready to provide expert consultations.</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats/Info Section */}
      <section className="py-16 bg-gradient-to-b from-white to-teal-50/50 px-4 sm:px-6 lg:px-8 mt-auto border-t border-teal-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-teal-200">
          <div className="pt-6 md:pt-0">
            <div className="text-4xl md:text-5xl font-extrabold text-teal-600 mb-2">
              {stats.patients > 1000 ? (stats.patients/1000).toFixed(1) + 'k+' : stats.patients + '+'}
            </div>
            <div className="text-slate-600 font-medium text-lg">Active Patients</div>
          </div>
          <div className="pt-6 md:pt-0">
            <div className="text-4xl md:text-5xl font-extrabold text-emerald-500 mb-2">
              {stats.doctors}+
            </div>
            <div className="text-slate-600 font-medium text-lg">Expert Doctors</div>
          </div>
          <div className="pt-6 md:pt-0">
            <div className="text-4xl md:text-5xl font-extrabold text-teal-600 mb-2">
              {stats.specialties}+
            </div>
            <div className="text-slate-600 font-medium text-lg">Specialties</div>
          </div>
          <div className="pt-6 md:pt-0">
            <div className="text-4xl md:text-5xl font-extrabold text-emerald-500 mb-2">24/7</div>
            <div className="text-slate-600 font-medium text-lg">Support Available</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
