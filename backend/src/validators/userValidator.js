const Joi = require('joi');

// Regex for exactly 10 digits starting with 6-9
const phoneRegex = /^[6-9]\d{9}$/;
// Regex for alphabetic characters and spaces only
const nameRegex = /^[A-Za-z\s]+$/;

const registerValidator = Joi.object({
  name: Joi.string().pattern(nameRegex).required().messages({
    'string.pattern.base': 'Name must contain only alphabets and spaces',
  }),
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  // For phone, we enforce that they pass the raw 10 digits, we will format with +91 if needed, or enforce +91 here.
  // The user requirement says: "number must be 10 digits and pre filled +91 and number start with 6-9"
  // So the input might be +91 followed by 10 digits.
  phone: Joi.string().pattern(/^\+91[6-9]\d{9}$/).required().messages({
    'string.pattern.base': 'Phone number must start with +91 followed by 10 digits starting with 6-9',
  }),
  role: Joi.string().valid('patient', 'doctor').required(),

  // Doctor optional fields
  specialization: Joi.string().allow('', null).when('role', { is: 'doctor', then: Joi.required() }),
  qualification: Joi.string().allow('', null).when('role', { is: 'doctor', then: Joi.required() }),
  experience: Joi.number().min(0).allow('', null).when('role', { is: 'doctor', then: Joi.required() }),
  consultationFee: Joi.number().min(0).allow('', null).when('role', { is: 'doctor', then: Joi.required() }),
  hospital: Joi.string().allow('', null).when('role', { is: 'doctor', then: Joi.required() }),
  availableDays: Joi.array().items(Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')).when('role', { is: 'doctor', then: Joi.required() }),
  availableFrom: Joi.string().pattern(/^([01]\d|2[0-3]):?([0-5]\d)$/).allow('', null).when('role', { is: 'doctor', then: Joi.required() }),
  availableTo: Joi.string().pattern(/^([01]\d|2[0-3]):?([0-5]\d)$/).allow('', null).when('role', { is: 'doctor', then: Joi.required() }),
  bio: Joi.string().allow('', null),

  // Patient optional fields
  dateOfBirth: Joi.date().iso().allow('', null).when('role', { is: 'patient', then: Joi.required() }),
  gender: Joi.string().valid('Male', 'Female', 'Other').allow('', null).when('role', { is: 'patient', then: Joi.required() }),
  address: Joi.string().allow('', null).when('role', { is: 'patient', then: Joi.required() }),
});

const loginValidator = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().required(),
});

module.exports = {
  registerValidator,
  loginValidator
};
