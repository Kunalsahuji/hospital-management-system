const express = require('express');
const router = express.Router();
const { bookAppointment, getAppointments, cancelAppointment, updateAppointmentStatus, rescheduleAppointment } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('patient'), bookAppointment)
  .get(protect, authorize('patient', 'doctor'), getAppointments);

router.patch('/:id/cancel', protect, authorize('patient'), cancelAppointment);
router.patch('/:id/reschedule', protect, authorize('patient'), rescheduleAppointment);
router.patch('/:id/status', protect, authorize('doctor'), updateAppointmentStatus);

module.exports = router;
