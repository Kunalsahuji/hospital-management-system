import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Stethoscope } from 'lucide-react';

const AuthSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  const actionText = isLogin ? 'Sign In' : 'Register';
  const actionPath = isLogin ? 'login' : 'register';

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 sm:mt-16 px-4 pb-32">
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Choose Your Portal
        </h1>
        <p className="text-lg text-gray-500">
          Select how you want to {actionText.toLowerCase()} to CareConnect
        </p>
      </motion.div>

      <motion.div 
        className="grid md:grid-cols-2 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Patient Card */}
        <motion.button
          variants={itemVariants}
          onClick={() => navigate(`/patient/${actionPath}`)}
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl border border-gray-100 transition-all text-left flex flex-col h-full group"
        >
          <div className="bg-teal-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-100 transition-colors">
            <User className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">I am a Patient</h2>
          <p className="text-gray-500 flex-1">
            Book appointments, manage your health records, and connect with top doctors seamlessly.
          </p>
          <div className="mt-8 font-medium text-teal-600 flex items-center group-hover:text-teal-700">
            {actionText} as Patient <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </motion.button>

        {/* Doctor Card */}
        <motion.button
          variants={itemVariants}
          onClick={() => navigate(`/doctor/${actionPath}`)}
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl border border-gray-100 transition-all text-left flex flex-col h-full group"
        >
          <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors">
            <Stethoscope className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">I am a Doctor</h2>
          <p className="text-gray-500 flex-1">
            Manage your schedule, view patient appointments, and provide excellent care.
          </p>
          <div className="mt-8 font-medium text-indigo-600 flex items-center group-hover:text-indigo-700">
            {actionText} as Doctor <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </motion.button>
      </motion.div>
      <p className="mt-8 text-center text-sm text-gray-500">
        Hospital administrator?{' '}
        <button
          type="button"
          onClick={() => navigate('/admin/login')}
          className="font-semibold text-teal-600 hover:text-teal-700"
        >
          Admin sign in
        </button>
      </p>
    </div>
  );
};

export default AuthSelection;
