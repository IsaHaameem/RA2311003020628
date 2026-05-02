const axios = require('axios');
const Log = require('../../../logging_middleware');

const createClient = (token) => {
    const instance = axios.create({
        baseURL: process.env.EVALUATION_BASE_URL,
        timeout: 5000,
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    instance.interceptors.response.use(
        res => res,
        err => {
            Log('backend', 'error', 'handler', `API Error: ${err.message}`);
            throw err;
        }
    );
    return instance;
};

module.exports = createClient;