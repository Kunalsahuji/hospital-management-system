const express = require('express');
const router = express.Router();
const { getPendingDoctors, reviewDoctor } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));
router.get('/doctors/pending', getPendingDoctors);
router.patch('/doctors/:id/review', reviewDoctor);

module.exports = router;
