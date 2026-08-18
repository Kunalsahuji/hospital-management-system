const express = require('express');
const router = express.Router();
const { getDoctors, getDoctorById, getPatients, getPublicStats } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', getPublicStats);
router.get('/doctors', protect, getDoctors);
router.get('/doctors/:id', protect, getDoctorById);
router.get('/patients', protect, getPatients);

module.exports = router;
