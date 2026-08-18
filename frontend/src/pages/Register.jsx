import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const location = useLocation();
  const isDoctor = location.pathname.includes('doctor');
  const roleName = isDoctor ? 'Doctor' : 'Patient';
  const role = isDoctor ? 'doctor' : 'patient';
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    // Patient
    dateOfBirth: '',
    gender: 'Male',
    address: '',
    // Doctor
    specialization: '',
    qualification: '',
    experience: '',
    consultationFee: '',
    hospital: '',
    availableFrom: '09:00',
    availableTo: '17:00',
    bio: ''
  });
  
  const [availableDays, setAvailableDays] = useState(['Monday', 'Wednesday', 'Friday']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleDayToggle = (day) => {
    setAvailableDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Strict enforcement
    if (name === 'name') {
      value = value.replace(/[^a-zA-Z\s]/g, ''); // Only alphabets and spaces
    }
    if (name === 'phone') {
      value = value.replace(/[^0-9]/g, '').slice(0, 10); // Only digits, max 10
    }
    if (['experience', 'consultationFee'].includes(name)) {
      value = value.replace(/[^0-9]/g, ''); // Only digits
    }

    setFormData({ ...formData, [name]: value });
    
    // Clear specific error on change
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.name) newErrors.name = 'Full Name is required';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password || formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Must be a 10-digit number starting with 6-9';
    }

    if (role === 'patient') {
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.address) newErrors.address = 'Address is required';
    }

    if (role === 'doctor') {
      if (!formData.specialization) newErrors.specialization = 'Specialization is required';
      if (!formData.qualification) newErrors.qualification = 'Qualification is required';
      if (!formData.experience) newErrors.experience = 'Experience is required';
      if (!formData.consultationFee) newErrors.consultationFee = 'Consultation fee is required';
      if (!formData.hospital) newErrors.hospital = 'Hospital/Clinic is required';
      if (!formData.availableFrom) newErrors.availableFrom = 'Start time is required';
      if (!formData.availableTo) newErrors.availableTo = 'End time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    // Format phone to ensure +91 as per requirements
    let formattedPhone = formData.phone;
    if (!formattedPhone.startsWith('+91')) {
      formattedPhone = '+91' + formattedPhone;
    }

    let payload = {};
    if (role === 'patient') {
      payload = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formattedPhone,
        role: 'patient',
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address
      };
    } else if (role === 'doctor') {
      payload = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formattedPhone,
        role: 'doctor',
        specialization: formData.specialization,
        qualification: formData.qualification,
        experience: Number(formData.experience),
        consultationFee: Number(formData.consultationFee),
        hospital: formData.hospital,
        availableDays: availableDays,
        availableFrom: formData.availableFrom,
        availableTo: formData.availableTo,
        bio: formData.bio
      };
    }

    const success = await register(payload);
    
    if (success) {
      if (role === 'patient') navigate('/patient/dashboard');
      if (role === 'doctor') navigate('/doctor/dashboard');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 mb-16 pb-24 sm:pb-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">{roleName} Registration</h2>
        <p className="text-center text-gray-500 mb-8">Join CareConnect as a {roleName}</p>



        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className={`block w-full px-3 py-2 border ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'} rounded-lg`} placeholder="John Doe" />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
              <input type="text" name="username" required value={formData.username} onChange={handleChange} className={`block w-full px-3 py-2 border ${errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'} rounded-lg`} placeholder="johndoe" />
              {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className={`block w-full px-3 py-2 border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'} rounded-lg`} placeholder="john@example.com" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
              <div className="flex">
                <span className={`inline-flex items-center px-3 rounded-l-md border border-r-0 ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'} text-gray-500 sm:text-sm`}>
                  +91
                </span>
                <input type="text" name="phone" required value={formData.phone} onChange={handleChange} className={`flex-1 block w-full px-3 py-2 border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'} rounded-none rounded-r-lg`} placeholder="9876543210" />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>
            <div className="md:col-span-2 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" minLength={6} required value={formData.password} onChange={handleChange} className={`block w-full px-3 pr-10 py-2 border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'} rounded-lg`} placeholder="••••••••" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          {role === 'patient' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth <span className="text-red-500">*</span></label>
                <input type="date" name="dateOfBirth" required value={formData.dateOfBirth} onChange={handleChange} className={`block w-full px-3 py-2 border ${errors.dateOfBirth ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'} rounded-lg`} />
                {errors.dateOfBirth && <p className="mt-1 text-xs text-red-500">{errors.dateOfBirth}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender <span className="text-red-500">*</span></label>
                <select name="gender" required value={formData.gender} onChange={handleChange} className={`block w-full px-3 py-2 border ${errors.gender ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'} rounded-lg`}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
                <input type="text" name="address" required value={formData.address} onChange={handleChange} className={`block w-full px-3 py-2 border ${errors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'} rounded-lg`} placeholder="123 Main St" />
                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
              </div>
            </div>
          )}

          {role === 'doctor' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization <span className="text-red-500">*</span></label>
                <input type="text" name="specialization" required value={formData.specialization} onChange={handleChange} className={`block w-full px-3 py-2 border ${errors.specialization ? 'border-red-500' : 'border-gray-300'} rounded-lg`} placeholder="Cardiologist" />
                {errors.specialization && <p className="mt-1 text-xs text-red-500">{errors.specialization}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification <span className="text-red-500">*</span></label>
                <input type="text" name="qualification" required value={formData.qualification} onChange={handleChange} className={`block w-full px-3 py-2 border ${errors.qualification ? 'border-red-500' : 'border-gray-300'} rounded-lg`} placeholder="MD, MBBS" />
                {errors.qualification && <p className="mt-1 text-xs text-red-500">{errors.qualification}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years) <span className="text-red-500">*</span></label>
                <input type="text" name="experience" min="0" required value={formData.experience} onChange={handleChange} className={`block w-full px-3 py-2 border ${errors.experience ? 'border-red-500' : 'border-gray-300'} rounded-lg`} placeholder="5" />
                {errors.experience && <p className="mt-1 text-xs text-red-500">{errors.experience}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₹) <span className="text-red-500">*</span></label>
                <input type="text" name="consultationFee" min="0" required value={formData.consultationFee} onChange={handleChange} className={`block w-full px-3 py-2 border ${errors.consultationFee ? 'border-red-500' : 'border-gray-300'} rounded-lg`} placeholder="500" />
                {errors.consultationFee && <p className="mt-1 text-xs text-red-500">{errors.consultationFee}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital / Clinic <span className="text-red-500">*</span></label>
                <input type="text" name="hospital" required value={formData.hospital} onChange={handleChange} className={`block w-full px-3 py-2 border ${errors.hospital ? 'border-red-500' : 'border-gray-300'} rounded-lg`} placeholder="City Care Hospital" />
                {errors.hospital && <p className="mt-1 text-xs text-red-500">{errors.hospital}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Available Days <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`px-3 py-1 text-sm rounded-full border ${availableDays.includes(day) ? 'bg-teal-100 border-teal-300 text-teal-800' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available From <span className="text-red-500">*</span></label>
                <input type="time" name="availableFrom" required value={formData.availableFrom} onChange={handleChange} className={`block w-full px-3 py-2 border ${errors.availableFrom ? 'border-red-500' : 'border-gray-300'} rounded-lg`} />
                {errors.availableFrom && <p className="mt-1 text-xs text-red-500">{errors.availableFrom}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available To <span className="text-red-500">*</span></label>
                <input type="time" name="availableTo" required value={formData.availableTo} onChange={handleChange} className={`block w-full px-3 py-2 border ${errors.availableTo ? 'border-red-500' : 'border-gray-300'} rounded-lg`} />
                {errors.availableTo && <p className="mt-1 text-xs text-red-500">{errors.availableTo}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange} className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500" placeholder="Brief description about yourself..."></textarea>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                Creating account...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to={`/${isDoctor ? 'doctor' : 'patient'}/login`} className="font-medium text-teal-600 hover:text-teal-500">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
