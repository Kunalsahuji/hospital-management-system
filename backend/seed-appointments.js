const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Appointment = require('./src/models/Appointment');

dotenv.config();

const seedAppointments = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    const patients = await User.find({ role: 'patient' });
    const doctors = await User.find({ role: 'doctor' });

    if (patients.length === 0 || doctors.length === 0) {
      console.log('Need both patients and doctors to seed appointments');
      process.exit(1);
    }

    const statuses = ['scheduled', 'confirmed', 'completed', 'cancelled'];
    const reasons = [
      'Routine checkup', 'Feeling feverish', 'Severe headache', 'Stomach pain',
      'Follow-up visit', 'Vaccination', 'Back pain', 'Allergy symptoms',
      'Annual physical exam', 'Skin rash consultation'
    ];

    console.log('Generating 20 new appointments...');

    const appointments = [];
    for (let i = 0; i < 20; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)];
      const doctor = doctors[Math.floor(Math.random() * doctors.length)];
      
      // Weight status to have fewer cancelled
      const statusRoll = Math.random();
      let status = 'scheduled';
      if (statusRoll > 0.8) status = 'cancelled';
      else if (statusRoll > 0.5) status = 'completed';
      else if (statusRoll > 0.3) status = 'confirmed';

      const reason = reasons[Math.floor(Math.random() * reasons.length)];
      
      // Random date within past 15 days to next 15 days
      const daysOffset = Math.floor(Math.random() * 30) - 15; 
      const date = new Date();
      date.setDate(date.getDate() + daysOffset);
      
      // Random time between 09:00 and 17:00
      const hour = Math.floor(Math.random() * 8) + 9;
      const minute = Math.random() > 0.5 ? '00' : '30';
      const time = `${hour.toString().padStart(2, '0')}:${minute}`;

      appointments.push({
        patient: patient._id,
        doctor: doctor._id,
        appointmentDate: date,
        appointmentTime: time,
        reason: reason,
        status: status
      });
    }

    await Appointment.insertMany(appointments);
    console.log(`Successfully seeded 20 appointments!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding appointments:', error);
    process.exit(1);
  }
};

seedAppointments();
