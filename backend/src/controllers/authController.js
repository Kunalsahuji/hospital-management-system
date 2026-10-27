const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { registerValidator, loginValidator } = require('../validators/userValidator');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const registerUser = async (req, res, next) => {
  try {
    const { error } = registerValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { name, username, email, password, phone, role } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();
    const userExists = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username },
        { phone: normalizedPhone }
      ]
    });

    if (userExists) {
      return res.status(409).json({
        success: false,
        message: 'A user with that email, username, or phone number already exists'
      });
    }

    const userData = {
      name,
      username,
      email: normalizedEmail,
      password,
      phone: normalizedPhone,
      role
    };

    if (role === 'doctor') {
      userData.specialization = req.body.specialization;
      userData.qualification = req.body.qualification;
      userData.experience = req.body.experience;
      userData.consultationFee = req.body.consultationFee;
      userData.hospital = req.body.hospital;
      userData.availableDays = req.body.availableDays;
      userData.availableFrom = req.body.availableFrom;
      userData.availableTo = req.body.availableTo;
      userData.bio = req.body.bio;
    } else {
      userData.dateOfBirth = req.body.dateOfBirth;
      userData.gender = req.body.gender;
      userData.address = req.body.address;
    }

    const user = await User.create(userData);

    if (user) {
      if (role === 'doctor') {
        return res.status(202).json({
          success: true,
          pendingApproval: true,
          message: 'Doctor registration submitted. Access will be available after verification.'
        });
      }

      const userDataObj = user.toObject();
      delete userDataObj.password;

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          ...userDataObj,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      const fieldLabels = {
        email: 'email',
        username: 'username',
        phone: 'phone number'
      };

      return res.status(409).json({
        success: false,
        message: fieldLabels[field]
          ? `A user with this ${fieldLabels[field]} already exists`
          : 'A user with these details already exists'
      });
    }

    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { error } = loginValidator.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      if (user.role === 'doctor' && !user.doctorVerified) {
        return res.status(403).json({
          success: false,
          message: 'Doctor account is pending verification'
        });
      }

      const userDataObj = user.toObject();
      delete userDataObj.password;

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          ...userDataObj,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updates = { ...req.body };
    
    // Prevent updating restricted fields
    delete updates.email;
    delete updates.password;
    delete updates.role;
    delete updates.doctorVerified;
    delete updates.username; // also prevent username changes

    Object.keys(updates).forEach(key => {
      user[key] = updates[key];
    });

    await user.save();

    const userDataObj = user.toObject();
    delete userDataObj.password;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userDataObj
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile
};
