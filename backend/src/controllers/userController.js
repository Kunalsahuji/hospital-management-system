const User = require('../models/User');
const Appointment = require('../models/Appointment');

const getPublicStats = async (req, res, next) => {
  try {
    const patientsCount = await User.countDocuments({ role: 'patient' });
    const doctorsCount = await User.countDocuments({ role: 'doctor', doctorVerificationStatus: 'approved' });
    
    const specializations = await User.distinct('specialization', {
      role: 'doctor',
      doctorVerificationStatus: 'approved'
    });
    const specialtiesCount = specializations.length;

    res.json({
      success: true,
      data: {
        patients: patientsCount,
        doctors: doctorsCount,
        specialties: specialtiesCount
      }
    });
  } catch (error) {
    next(error);
  }
};


const getDoctors = async (req, res, next) => {
  try {
    const filters = { role: 'doctor', doctorVerificationStatus: 'approved' };
    
    // Optional filtering by specialization
    if (req.query.specialization) {
      filters.specialization = { $regex: req.query.specialization, $options: 'i' };
    }

    const doctors = await User.find(filters).select('-password');
    res.json({
      success: true,
      data: doctors
    });
  } catch (error) {
    next(error);
  }
};

const getPatients = async (req, res, next) => {
  try {
    const patientIds = await Appointment.distinct('patient', { doctor: req.user._id });
    const filters = { role: 'patient', _id: { $in: patientIds } };
    
    if (req.query.name) {
      const escapedName = req.query.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filters.name = { $regex: escapedName, $options: 'i' };
    }

    const patients = await User.find(filters).select('name username phone address');
    res.json({
      success: true,
      data: patients
    });
  } catch (error) {
    next(error);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await User.findOne({
      _id: req.params.id,
      role: 'doctor',
      doctorVerificationStatus: 'approved'
    }).select('-password');
    
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({
      success: true,
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  getPatients,
  getPublicStats
};
