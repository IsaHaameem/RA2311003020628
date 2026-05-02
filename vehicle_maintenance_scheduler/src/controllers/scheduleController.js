const service = require('../services/scheduleService');
const Log = require('../../../logging_middleware');

exports.getSchedule = async (req, res) => {
    try {
        const data = await service.generateSchedule();
        Log('backend', 'info', 'controller', 'Schedule successfully generated');
        res.json(data);
    } catch (error) {
        Log('backend', 'error', 'controller', `Schedule generation failed: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};