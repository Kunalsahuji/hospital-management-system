const Joi = require('joi');

const createAppointmentValidator = Joi.object({
  doctor: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid doctor ID',
  }),
  appointmentDate: Joi.date().iso().min('now').required().messages({
    'date.min': 'Appointment date cannot be in the past'
  }),
  appointmentTime: Joi.string().pattern(/^([01]\d|2[0-3]):?([0-5]\d)$/).required().messages({
    'string.pattern.base': 'Time must be in HH:mm format',
  }),
  reason: Joi.string().required(),
  notes: Joi.string().allow('', null),
});

const updateStatusValidator = Joi.object({
  status: Joi.string().valid('confirmed', 'completed', 'cancelled', 'rejected').required()
});

const rescheduleValidator = Joi.object({
  appointmentDate: Joi.date().iso().min('now').required().messages({
    'date.min': 'Appointment date cannot be in the past'
  }),
  appointmentTime: Joi.string().pattern(/^([01]\d|2[0-3]):?([0-5]\d)$/).required().messages({
    'string.pattern.base': 'Time must be in HH:mm format',
  })
});

module.exports = {
  createAppointmentValidator,
  updateStatusValidator,
  rescheduleValidator
};
