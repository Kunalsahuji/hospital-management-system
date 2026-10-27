const express = require('express');
const router = express.Router();
const { getDoctorApplications, getPendingDoctors, reviewDoctor } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));
router.get('/doctors', getDoctorApplications);
router.get('/doctors/pending', getPendingDoctors);
router.patch('/doctors/:id/review', reviewDoctor);

module.exports = router;
