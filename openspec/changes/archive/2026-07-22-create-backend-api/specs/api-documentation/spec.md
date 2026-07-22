## ADDED Requirements

### Requirement: OpenAPI specification describes the API

The backend SHALL maintain an OpenAPI 3.1 specification that describes every `/api/tasks` endpoint, including request bodies, path parameters, response schemas for success and error cases, and the applicable status codes. Reusable schemas (Task, Developer, Skill, Error) SHALL be defined as components.

#### Scenario: Every task endpoint is documented

- **WHEN** a maintainer inspects the OpenAPI specification
- **THEN** it contains path definitions for creating, retrieving (list and by id), assigning, and updating the status of tasks, each with request and response schemas

#### Scenario: Error responses are documented

- **WHEN** a maintainer inspects a documented endpoint
- **THEN** its error responses (e.g. `400`, `404`, `409`) reference the shared `Error` schema

### Requirement: Specification is served by the backend

The backend SHALL expose the OpenAPI document over HTTP so clients and tooling can retrieve it (e.g. `GET /api/openapi.json`).

#### Scenario: Retrieve the OpenAPI document

- **WHEN** a client sends a request to the OpenAPI document endpoint
- **THEN** the API returns `200` with the OpenAPI 3.1 document as JSON

### Requirement: Implementation conforms to the specification

The implemented endpoints SHALL conform to the OpenAPI specification: paths, methods, status codes, and response shapes MUST match what the document declares.

#### Scenario: Responses match the documented schema

- **WHEN** a documented endpoint is called with a valid request
- **THEN** the response status code and body structure match the corresponding schema in the OpenAPI document

#### Scenario: Specification stays in sync with the routes

- **WHEN** a task endpoint is added or changed
- **THEN** the OpenAPI document is updated so it continues to describe the actual routes
