const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { createAppointmentValidator, updateStatusValidator, rescheduleValidator } = require('../validators/appointmentValidator');

// Patient books an appointment
const bookAppointment = async (req, res, next) => {
  try {
    const { error } = createAppointmentValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { doctor, appointmentDate, appointmentTime, reason, notes } = req.body;

    // Check if doctor exists and is actually a doctor
    const doctorExists = await User.findOne({
      _id: doctor,
      role: 'doctor',
      doctorVerificationStatus: 'approved'
    });
    if (!doctorExists) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Check if the slot is already booked for this doctor
    const existingAppointment = await Appointment.findOne({
      doctor,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $in: ['scheduled', 'confirmed'] } // Cancelled or rejected slots are free
    });

    if (existingAppointment) {
      return res.status(409).json({ success: false, message: 'Appointment slot is already booked' });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor,
      appointmentDate,
      appointmentTime,
      reason,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Appointment slot is already booked' });
    }
    next(error);
  }
};

// Get appointments for the logged-in user
const getAppointments = async (req, res, next) => {
  try {
    let appointments;
    if (req.user.role === 'patient') {
      appointments = await Appointment.find({ patient: req.user._id }).populate('doctor', 'name specialization hospital');
    } else if (req.user.role === 'doctor') {
      appointments = await Appointment.find({ doctor: req.user._id }).populate('patient', 'name phone');
    }

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

// Patient cancels their own appointment
const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Ensure only the patient who owns the appointment can cancel it
    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this appointment' });
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ success: false, message: `Cannot cancel an appointment that is already ${appointment.status}` });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// Doctor updates appointment status
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { error } = updateStatusValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Ensure only the doctor assigned to the appointment can update it
    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this appointment' });
    }

    // Basic state machine validation
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ success: false, message: `Cannot update an appointment that is already ${appointment.status}` });
    }

    appointment.status = status;
    await appointment.save();

    res.json({
      success: true,
      message: `Appointment status updated to ${status}`,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// Patient reschedules their own appointment
const rescheduleAppointment = async (req, res, next) => {
  try {
    const { error } = rescheduleValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { appointmentDate, appointmentTime } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Ensure only the patient who owns the appointment can reschedule it
    if (appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to reschedule this appointment' });
    }

    // Check if appointment is completed or cancelled
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ success: false, message: `Cannot reschedule an appointment that is already ${appointment.status}` });
    }

    // Check if the new slot is already booked for this doctor
    const existingAppointment = await Appointment.findOne({
      doctor: appointment.doctor,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $in: ['scheduled', 'confirmed'] },
      _id: { $ne: appointment._id } // exclude current appointment
    });

    if (existingAppointment) {
      return res.status(409).json({ success: false, message: 'The new appointment slot is already booked' });
    }

    appointment.appointmentDate = appointmentDate;
    appointment.appointmentTime = appointmentTime;
    appointment.status = 'scheduled'; // Reset to scheduled so doctor confirms the new time
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      data: appointment
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Appointment slot is already booked' });
    }
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  cancelAppointment,
  updateAppointmentStatus,
  rescheduleAppointment
};
