import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hospital, LogOut, User as UserIcon, Calendar, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate('/');
  };

  const getFirstName = (name, role) => {
    if (!name) return '';
    const cleanName = name.replace(/^Dr\.?\s+/i, '');
    const firstName = cleanName.split(' ')[0];
    return role === 'doctor' ? `Dr. ${firstName}` : firstName;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-teal-600 font-bold text-xl">
              <Hospital className="mr-2" size={24} />
              CareConnect
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <>
                <NavLink to="/login" className={({isActive}) => `px-4 py-2 rounded-md font-medium transition-colors ${isActive ? 'bg-teal-600 text-white shadow-md' : 'text-gray-700 hover:bg-teal-50 hover:text-teal-600'}`}>Login</NavLink>
                <NavLink to="/register" className={({isActive}) => `px-4 py-2 rounded-md font-medium transition-colors ${isActive ? 'bg-teal-600 text-white shadow-md' : 'text-gray-700 hover:bg-teal-50 hover:text-teal-600'}`}>Register</NavLink>
              </>
            ) : (
              <>
                {user.role === 'patient' && (
                  <>
                    <NavLink to="/patient/dashboard" className={({isActive}) => `px-3 py-2 rounded-md font-medium flex items-center transition-colors ${isActive ? 'text-teal-600 bg-teal-50' : 'text-gray-700 hover:text-teal-600'}`}>
                       Dashboard
                    </NavLink>
                    <NavLink to="/doctors" className={({isActive}) => `px-3 py-2 rounded-md font-medium flex items-center transition-colors ${isActive ? 'text-teal-600 bg-teal-50' : 'text-gray-700 hover:text-teal-600'}`}>
                       Doctors
                    </NavLink>
                  </>
                )}
                
                {user.role === 'doctor' && (
                  <>
                    <NavLink to="/doctor/dashboard" className={({isActive}) => `px-3 py-2 rounded-md font-medium flex items-center transition-colors ${isActive ? 'text-teal-600 bg-teal-50' : 'text-gray-700 hover:text-teal-600'}`}>
                       Dashboard
                    </NavLink>
                    <NavLink to="/patients" className={({isActive}) => `px-3 py-2 rounded-md font-medium flex items-center transition-colors ${isActive ? 'text-teal-600 bg-teal-50' : 'text-gray-700 hover:text-teal-600'}`}>
                       Patients
                    </NavLink>
                  </>
                )}

                <div className="border-l border-gray-300 h-6 mx-2"></div>
                
                <Link 
                  to={user.role === 'patient' ? '/patient/dashboard/profile' : '/doctor/dashboard/profile'}
                  className="text-sm text-gray-500 font-medium truncate max-w-[120px] hover:text-teal-600 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <UserIcon size={16} />
                  Hi, {getFirstName(user.name, user.role)}
                </Link>

                <button 
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 hover:text-teal-600 focus:outline-none p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {!user ? (
              <>
                <NavLink to="/login" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `block px-3 py-2 rounded-md font-medium ${isActive ? 'bg-teal-600 text-white shadow-md' : 'text-gray-700 hover:bg-teal-50 hover:text-teal-600'}`}>Login</NavLink>
                <NavLink to="/register" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `block px-3 py-2 rounded-md font-medium mt-2 ${isActive ? 'bg-teal-600 text-white shadow-md' : 'text-gray-700 hover:bg-teal-50 hover:text-teal-600'}`}>Register</NavLink>
              </>
            ) : (
              <>
                <Link 
                  to={user.role === 'patient' ? '/patient/dashboard/profile' : '/doctor/dashboard/profile'}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-3 py-2 text-sm text-gray-500 font-medium border-b border-gray-100 mb-2 hover:bg-gray-50 hover:text-teal-600 flex items-center gap-2 transition-colors cursor-pointer block"
                >
                  <UserIcon size={16} />
                  Hi, {user.role === 'doctor' && !user.name.startsWith('Dr.') ? `Dr. ${user.name}` : user.name}
                </Link>
                {user.role === 'patient' && (
                  <>
                    <NavLink to="/patient/dashboard" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `block px-3 py-2 rounded-md font-medium ${isActive ? 'text-teal-600 bg-teal-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                       Dashboard
                    </NavLink>
                    <NavLink to="/doctors" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `block px-3 py-2 rounded-md font-medium ${isActive ? 'text-teal-600 bg-teal-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                       Doctors
                    </NavLink>
                  </>
                )}
                
                {user.role === 'doctor' && (
                  <>
                    <NavLink to="/doctor/dashboard" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `block px-3 py-2 rounded-md font-medium ${isActive ? 'text-teal-600 bg-teal-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                       Dashboard
                    </NavLink>
                    <NavLink to="/patients" onClick={() => setIsMenuOpen(false)} className={({isActive}) => `block px-3 py-2 rounded-md font-medium ${isActive ? 'text-teal-600 bg-teal-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                       Patients
                    </NavLink>
                  </>
                )}

                <button 
                  onClick={handleLogout}
                  className="w-full text-left text-red-500 hover:bg-red-50 px-3 py-2 rounded-md font-medium mt-2 flex items-center"
                >
                  <LogOut size={18} className="mr-2" />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
