const axios = require('axios');

const Log = async (stack, level, pkg, message) => {
    const logData = { stack, level, package: pkg, message };
    console.log(`[${level.toUpperCase()}] [${pkg}]: ${message}`);

    const postLog = async (retryCount = 0) => {
        try {
            await axios.post('http://20.207.122.201/evaluation-service/logs', logData, {
                timeout: 5000,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            if (error.response && error.response.status === 401) return; // Silent ignore 401
            if (retryCount < 2) {
                const delay = retryCount === 0 ? 200 : 400;
                setTimeout(() => postLog(retryCount + 1), delay);
            }
        }
    };

    postLog(); // Fire and forget
};

module.exports = Log;