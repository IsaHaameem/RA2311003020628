const repo = require('../repository/evaluationRepository');
const solveKnapsack = require('../utils/knapsack');
const Log = require('../../../logging_middleware');

class ScheduleService {
    async generateSchedule() {
        Log('backend', 'info', 'service', 'Generating maintenance schedule');
        
        const [depotsRes, vehiclesRes] = await Promise.all([repo.getDepots(), repo.getVehicles()]);

        // Access the nested arrays from the API response
        const depots = depotsRes?.depots || [];
        const allAvailableTasks = vehiclesRes?.vehicles || [];

        if (depots.length === 0) return { depots: [] };

        return {
            depots: depots.map(depot => {
                const depotId = depot.ID;
                const capacity = Math.floor(Number(depot.MechanicHours || 0));

                // Clean the task data to ensure strict numbers for the algorithm
                const cleanTasks = allAvailableTasks.map(t => ({
                    TaskID: t.TaskID,
                    Duration: Math.floor(Number(t.Duration || 0)),
                    Impact: Math.floor(Number(t.Impact || 0))
                })).filter(t => t.Duration > 0 && t.Duration <= capacity);

                // Run the optimized Knapsack
                const result = solveKnapsack(cleanTasks, capacity);

                Log('backend', 'debug', 'service', `Depot ${depotId}: Selected ${result.selectedTasks.length} tasks. Impact: ${result.totalImpact}`);

                return {
                    id: depotId,
                    selectedTasks: result.selectedTasks,
                    totalImpact: result.totalImpact,
                    totalDuration: result.totalDuration
                };
            })
        };
    }
}

module.exports = new ScheduleService();