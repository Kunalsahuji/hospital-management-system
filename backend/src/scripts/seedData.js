const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await User.deleteMany();
    await Appointment.deleteMany();

    const doctorUser = await User.create({
      name: 'Dr. Jane Smith',
      username: 'janesmith',
      email: 'jane@example.com',
      password: 'password123',
      phone: '+919876543210',
      role: 'doctor',
      specialization: 'Cardiologist',
      qualification: 'MBBS, MD',
      experience: 10,
      consultationFee: 1000,
      hospital: 'City Heart Center',
      availableDays: ['Monday', 'Wednesday', 'Friday'],
      availableFrom: '09:00',
      availableTo: '17:00',
      bio: 'Expert in cardiovascular health.'
    });

    const patientUser = await User.create({
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123',
      phone: '+919876543211',
      role: 'patient',
      dateOfBirth: '1985-05-15',
      gender: 'Male',
      address: '123 Main St, Springfield'
    });

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
