const createClient = require('../utils/httpClient');
const Log = require('../../../logging_middleware');

const getDepots = async () => {
    // Creating the client inside the function ensures process.env is fully loaded
    const client = createClient(process.env.EVAL_API_TOKEN);
    Log('backend', 'info', 'repository', 'Fetching depots data');
    const { data } = await client.get('/depots');
    return data;
};

const getVehicles = async () => {
    const client = createClient(process.env.EVAL_API_TOKEN);
    Log('backend', 'info', 'repository', 'Fetching vehicles data');
    const { data } = await client.get('/vehicles');
    return data;
};

module.exports = {
    getDepots,
    getVehicles
};