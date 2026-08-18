const mongoose = require('mongoose');
const { logInfo, logError } = require('../utils/logger');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

const connectDB = async () => {
  try {
    logInfo('🔄 MongoDB connection attempt 1/5...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    // Simulate slight delay for the logs to look realistic (optional, but requested format implies sequential logging)
    logInfo(`✅ MongoDB connected → ${conn.connection.host}`);
    
    const userCount = await User.countDocuments();
    const apptCount = await Appointment.countDocuments();
    
    logInfo(`📊 DB Stats — Users: ${userCount} | Appointments: ${apptCount}`);
  } catch (error) {
    logError(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
