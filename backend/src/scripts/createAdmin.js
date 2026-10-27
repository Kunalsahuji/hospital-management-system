const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Joi = require('joi');
const User = require('../models/User');

dotenv.config();

const requiredVariables = [
  'ADMIN_NAME',
  'ADMIN_USERNAME',
  'ADMIN_EMAIL',
  'ADMIN_PHONE',
  'ADMIN_PASSWORD'
];

const createAdmin = async () => {
  const missingVariables = requiredVariables.filter((key) => !process.env[key]);
  if (missingVariables.length) {
    throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
  }

  const { error } = Joi.object({
    ADMIN_NAME: Joi.string().trim().min(1).required(),
    ADMIN_USERNAME: Joi.string().trim().alphanum().min(3).max(30).required(),
    ADMIN_EMAIL: Joi.string().trim().email().required(),
    ADMIN_PHONE: Joi.string().trim().pattern(/^\+91[6-9]\d{9}$/).required(),
    ADMIN_PASSWORD: Joi.string().min(12).required()
  }).validate(
    Object.fromEntries(requiredVariables.map((key) => [key, process.env[key]])),
    { abortEarly: false }
  );

  if (error) {
    throw new Error(error.details.map((detail) => detail.message).join('; '));
  }

  await mongoose.connect(process.env.MONGODB_URI);

  if (await User.exists({ role: 'admin' })) {
    throw new Error('An admin account already exists; refusing to create another');
  }

  const admin = await User.create({
    name: process.env.ADMIN_NAME.trim(),
    username: process.env.ADMIN_USERNAME.trim(),
    email: process.env.ADMIN_EMAIL.trim().toLowerCase(),
    phone: process.env.ADMIN_PHONE.trim(),
    password: process.env.ADMIN_PASSWORD,
    role: 'admin'
  });

  console.log(`Admin account created for ${admin.username}. Keep these credentials private.`);
};

createAdmin()
  .catch((error) => {
    console.error('Unable to create admin account:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
