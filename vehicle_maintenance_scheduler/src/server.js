require('dotenv').config();
const app = require('./app');
const Log = require('../../logging_middleware');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    Log('backend', 'info', 'server', `Server is running on port ${PORT}`);
    console.log(`🚀 Evaluation Service running at http://localhost:${PORT}`);
});