# API Documentation

This document provides detailed information about all the APIs available in the LLM Ops system.

## Table of Contents
- [Experiments API](#experiments-api)
- [Test Cases API](#test-cases-api)
- [GROQ Evaluation API](#groq-evaluation-api)

## Experiments API

### Get All Experiments
- **Endpoint:** `GET /api/experiments`
- **Description:** Retrieves all experiments from the database
- **Response:** Array of experiment objects
- **Example Response:**
```json
[
  {
    "id": 1,
    "name": "Experiment Name",
    "systemPrompt": "System prompt text",
    "mistral": true,
    "google": false,
    "meta": true
  }
]
```

### Create Experiment
- **Endpoint:** `POST /api/experiments`
- **Description:** Creates a new experiment
- **Request Body:**
```json
{
  "name": "Experiment Name",
  "systemPrompt": "System prompt text",
  "mistral": true,
  "google": false,
  "meta": true
}
```
- **Response:** Created experiment object

### Get Single Experiment
- **Endpoint:** `GET /api/experiments/:id`
- **Description:** Retrieves a specific experiment by ID
- **Response:** Single experiment object
- **Error:** 404 if experiment not found

### Update Experiment
- **Endpoint:** `PUT /api/experiments/:id`
- **Description:** Updates an existing experiment
- **Request Body:** Same as Create Experiment
- **Response:** Updated experiment object

### Delete Experiment
- **Endpoint:** `DELETE /api/experiments/:id`
- **Description:** Deletes an experiment and its associated test cases
- **Response:** Success message
- **Example Response:**
```json
{
  "message": "Experiment and associated test cases deleted successfully"
}
```

### Run Experiment
- **Endpoint:** `POST /api/experiments/:id/run`
- **Description:** Executes all test cases associated with an experiment
- **Response:** Success message
- **Example Response:**
```json
{
  "message": "Experiment run successfully"
}
```

## Test Cases API

### Get All Test Cases
- **Endpoint:** `GET /api/test-cases`
- **Description:** Retrieves all test cases with their associated experiment information
- **Response:** Array of test case objects
- **Example Response:**
```json
[
  {
    "id": 1,
    "experiment_id": 1,
    "test_case": "Test case text",
    "expected_output": "Expected output text",
    "experiment": {
      "id": 1,
      "name": "Experiment Name"
    }
  }
]
```

### Create Test Case
- **Endpoint:** `POST /api/test-cases`
- **Description:** Creates a new test case
- **Request Body:**
```json
{
  "experiment_id": 1,
  "test_case": "Test case text",
  "expected_output": "Expected output text"
}
```
- **Response:** Created test case object

### Update Test Case
- **Endpoint:** `PUT /api/test-cases/:id`
- **Description:** Updates an existing test case
- **Request Body:** Partial test case object with fields to update
- **Response:** Updated test case object

### Delete Test Case
- **Endpoint:** `DELETE /api/test-cases/:id`
- **Description:** Deletes a test case
- **Response:** Success message
- **Example Response:**
```json
{
  "message": "Test case deleted successfully"
}
```

## GROQ Evaluation API

### Evaluate Test Case
- **Endpoint:** `POST /api/groq/evaluate`
- **Description:** Evaluates a test case using multiple LLM models (Mistral, Meta, and Google)
- **Request Body:**
```json
{
  "systemPrompt": "System prompt text",
  "userInput": "Test case input",
  "expectedOutput": "Expected output text"
}
```
- **Response:** Evaluation results from all models
- **Example Response:**
```json
{
  "mistral": {
    "output": "Model output text",
    "factually": true,
    "evaluation": "Factual"
  },
  "meta": {
    "output": "Model output text",
    "factually": true,
    "evaluation": "Factual"
  },
  "google": {
    "output": "Model output text",
    "factually": false,
    "evaluation": "Not Factual"
  }
}
```

## Error Handling

All APIs follow a consistent error handling pattern:

- **400 Bad Request:** Invalid request parameters
- **404 Not Found:** Requested resource not found
- **405 Method Not Allowed:** Unsupported HTTP method
- **500 Internal Server Error:** Server-side error

Error responses follow this format:
```json
{
  "error": "Error message description"
}
``` 