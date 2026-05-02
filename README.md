# README.md

## Overview
This project provides a backend solution for optimizing vehicle maintenance schedules across multiple depots. It includes a core scheduling service, a custom logging middleware, and architectural documentation for a notification microservice.

## Project Structure
* **`vehicle_maintenance_scheduler/`**: The primary Express application containing the scheduling logic and API routes.
* **`logging_middleware/`**: A separate module used to intercept and transmit system logs to a remote evaluation server.
* **`notification_system_design.md`**: Architectural documentation for a scalable, real-time notification system.

---

## Setup and Installation

### 1. Install Dependencies
Install the required packages for both the application and the middleware:

```bash
# Application setup
cd vehicle_maintenance_scheduler
npm install

# Middleware setup
cd ../logging_middleware
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `vehicle_maintenance_scheduler` directory with the following variables:

```text
PORT=3000
EVAL_API_URL=http://20.207.122.201/evaluation-service
EVAL_API_TOKEN=<YOUR_BEARER_TOKEN>
```

---

## API Testing Workflow

### 1. Registration
Users must register with the evaluation server to obtain their unique credentials.

* **Endpoint**: `POST [http://20.207.122.201/evaluation-service/register](http://20.207.122.201/evaluation-service/register)`
* **Body (JSON)**:
```json
{
    "email": "<YOUR_EMAIL>",
    "name": "<YOUR_NAME>",
    "rollNo": "<YOUR_ROLL_NUMBER>",
    "accessCode": "<YOUR_ACCESS_CODE>",
    "githubUrl": "<YOUR_GITHUB_PROFILE_URL>",
    "phoneNo": "<YOUR_PHONE_NUMBER>"
}
```

### 2. Authentication (Login)
Exchange your registration details for a temporary JWT Bearer token.

* **Endpoint**: `POST [http://20.207.122.201/evaluation-service/auth](http://20.207.122.201/evaluation-service/auth)`
* **Body (JSON)**:
```json
{
    "email": "<YOUR_EMAIL>",
    "clientID": "<YOUR_CLIENT_ID>",
    "clientSecret": "<YOUR_CLIENT_SECRET>"
}
```

### 3. Generate Schedule
Use the generated token to run the maintenance optimization algorithm.

* **Endpoint**: `GET http://localhost:3000/schedule`
* **Header**: `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
* **Logic**: The service fetches depot and vehicle data to perform a 0/1 Knapsack optimization. It maximizes maintenance impact scores while ensuring total duration does not exceed the available mechanic hours for each depot.

---

## System Capabilities

### Health Check
* **Endpoint**: `GET /health`
* **Purpose**: Verifies server uptime and returns the system identifier.

### Logging
All internal operations and API requests are managed by the `logging_middleware`, which transmits execution logs to the evaluation server via `POST /logs`.

### Optimization
The scheduler uses a dynamic programming approach to ensure:
* **Constraint Compliance**: Total task duration never exceeds available mechanic hours.
* **Impact Maximization**: The selection of tasks yields the highest possible priority score for each depot.</YOUR_ACCESS_TOKEN>
