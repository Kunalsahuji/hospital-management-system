const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['patient', 'doctor'],
    required: true,
  },
  doctorVerified: {
    type: Boolean,
    default: false,
  },
  // Doctor specific fields
  specialization: {
    type: String,
  },
  qualification: {
    type: String,
  },
  experience: {
    type: Number,
  },
  consultationFee: {
    type: Number,
  },
  hospital: {
    type: String,
  },
  availableDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  availableFrom: {
    type: String, // HH:mm format
  },
  availableTo: {
    type: String, // HH:mm format
  },
  bio: {
    type: String,
  },
  // Patient specific fields
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  address: {
    type: String,
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Ensure doctor fields are only present if role is doctor, and same for patient
userSchema.pre('validate', function() {
  if (this.role === 'patient') {
    this.specialization = undefined;
    this.qualification = undefined;
    this.experience = undefined;
    this.consultationFee = undefined;
    this.hospital = undefined;
    this.availableDays = undefined;
    this.availableFrom = undefined;
    this.availableTo = undefined;
    this.bio = undefined;
  } else if (this.role === 'doctor') {
    this.dateOfBirth = undefined;
    this.gender = undefined;
    this.address = undefined;
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
