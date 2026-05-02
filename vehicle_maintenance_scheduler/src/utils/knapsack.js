const solveKnapsack = (tasks, capacity) => {
    const n = tasks.length;
    // Create DP table initialized with 0
    const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));

    // Build table in bottom-up manner
    for (let i = 1; i <= n; i++) {
        const weight = tasks[i - 1].Duration;
        const val = tasks[i - 1].Impact;

        for (let w = 0; w <= capacity; w++) {
            if (weight <= w) {
                // Max of (including this task) or (excluding this task)
                dp[i][w] = Math.max(val + dp[i - 1][w - weight], dp[i - 1][w]);
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    // Backtrack to find which tasks were selected
    const selected = [];
    let currentCapacity = capacity;
    let calculatedDuration = 0;

    for (let i = n; i > 0 && currentCapacity > 0; i--) {
        if (dp[i][currentCapacity] !== dp[i - 1][currentCapacity]) {
            const task = tasks[i - 1];
            selected.push(task);
            currentCapacity -= task.Duration;
            calculatedDuration += task.Duration;
        }
    }

    return {
        totalImpact: dp[n][capacity],
        selectedTasks: selected,
        totalDuration: calculatedDuration
    };
};

module.exports = solveKnapsack;