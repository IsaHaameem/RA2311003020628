require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    evalBaseUrl: process.env.EVALUATION_BASE_URL,
    evalApiToken: process.env.EVAL_API_TOKEN
};