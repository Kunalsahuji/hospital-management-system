const Joi = require('joi');
const User = require('../models/User');

const reviewSchema = Joi.object({
  decision: Joi.string().valid('approve', 'reject').required()
}).unknown(false);

const listDoctorsSchema = Joi.object({
  status: Joi.string().valid('all', 'pending', 'approved', 'rejected').default('pending'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(30).default(12)
}).unknown(false);

const pendingDoctorFilter = {
  role: 'doctor',
  $or: [
    { doctorVerificationStatus: 'pending' },
    { doctorVerificationStatus: { $exists: false } }
  ]
};

const getDoctorApplications = async (req, res, next) => {
  try {
    const { error, value } = listDoctorsSchema.validate(req.query);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { status, page, limit } = value;
    const filter = status === 'all'
      ? { role: 'doctor' }
      : status === 'pending'
        ? pendingDoctorFilter
        : { role: 'doctor', doctorVerificationStatus: status };
    const countFilter = (doctorStatus) => (
      doctorStatus === 'pending'
        ? pendingDoctorFilter
        : { role: 'doctor', doctorVerificationStatus: doctorStatus }
    );
    const [doctors, total, pending, approved, rejected] = await Promise.all([
      User.find(filter)
        .select('name username email phone specialization qualification experience consultationFee hospital availableDays availableFrom availableTo bio createdAt doctorVerificationStatus')
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
      User.countDocuments(countFilter('pending')),
      User.countDocuments(countFilter('approved')),
      User.countDocuments(countFilter('rejected'))
    ]);

    res.json({
      success: true,
      data: doctors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        counts: { all: pending + approved + rejected, pending, approved, rejected }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getPendingDoctors = async (req, res, next) => {
  try {
    const doctors = await User.find(pendingDoctorFilter)
      .select('name username email phone specialization qualification experience consultationFee hospital availableDays availableFrom availableTo bio createdAt')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: doctors
    });
  } catch (error) {
    next(error);
  }
};

const reviewDoctor = async (req, res, next) => {
  try {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const status = req.body.decision === 'approve' ? 'approved' : 'rejected';
    const doctor = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        ...pendingDoctorFilter
      },
      {
        $set: {
          doctorVerificationStatus: status,
          doctorVerified: status === 'approved'
        }
      },
      { returnDocument: 'after', runValidators: true }
    ).select('name username email doctorVerificationStatus doctorVerified');

    if (!doctor) {
      const existingDoctor = await User.exists({ _id: req.params.id, role: 'doctor' });
      if (!existingDoctor) {
        return res.status(404).json({ success: false, message: 'Pending doctor not found' });
      }

      return res.status(409).json({
        success: false,
        message: 'This doctor application has already been reviewed'
      });
    }

    res.json({
      success: true,
      message: `Doctor application ${status}`,
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDoctorApplications, getPendingDoctors, reviewDoctor };
