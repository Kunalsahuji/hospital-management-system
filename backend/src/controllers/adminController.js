const Joi = require('joi');
const User = require('../models/User');

const reviewSchema = Joi.object({
  decision: Joi.string().valid('approve', 'reject').required()
}).unknown(false);

const pendingDoctorFilter = {
  role: 'doctor',
  $or: [
    { doctorVerificationStatus: 'pending' },
    { doctorVerificationStatus: { $exists: false } }
  ]
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

module.exports = { getPendingDoctors, reviewDoctor };
