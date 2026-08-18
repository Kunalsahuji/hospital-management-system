const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  appointmentTime: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'rejected'],
    default: 'scheduled',
  }
}, {
  timestamps: true
});

// Compound index to prevent double booking easily
appointmentSchema.index({ doctor: 1, appointmentDate: 1, appointmentTime: 1 }, { unique: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
