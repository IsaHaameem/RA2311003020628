const Log = require('../../../logging_middleware');

const notFound = (req, res) => {
    Log('backend', 'warn', 'handler', `Route not found: ${req.originalUrl}`);
    res.status(404).json({
        error: 'Not Found',
        message: `The route ${req.originalUrl} does not exist.`
    });
};

module.exports = notFound;