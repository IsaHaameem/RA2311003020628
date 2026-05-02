const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const Log = require('../../../logging_middleware');

// GET /schedule
router.get('/schedule', (req, res, next) => {
    Log('backend', 'info', 'route', 'Incoming request to /schedule');
    next();
}, scheduleController.getSchedule);

module.exports = router;