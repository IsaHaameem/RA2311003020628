const express = require('express');
const scheduleRoutes = require('./routes/scheduleRoutes');
const notFound = require('./middleware/notFound');
const Log = require('../../logging_middleware');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
    Log('backend', 'debug', 'route', 'Health check pinged');
    res.json({ status: 'UP', rollNo: 'RA2311003020628' });
});

app.use('/', scheduleRoutes);
app.use(notFound);

module.exports = app;