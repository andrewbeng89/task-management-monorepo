## MODIFIED Requirements

### Requirement: OpenAPI specification describes the API

The backend SHALL maintain an OpenAPI 3.1 specification that describes every API endpoint — including the `/api/tasks`, `/api/developers`, and `/api/skills` endpoints — with request bodies, path parameters, response schemas for success and error cases, and the applicable status codes. Reusable schemas (Task, Developer, Skill, Error) SHALL be defined as components.

#### Scenario: Every task endpoint is documented

- **WHEN** a maintainer inspects the OpenAPI specification
- **THEN** it contains path definitions for creating, retrieving (list and by id), assigning, and updating the status of tasks, each with request and response schemas

#### Scenario: Developer and skill endpoints are documented

- **WHEN** a maintainer inspects the OpenAPI specification
- **THEN** it contains path definitions for retrieving a developer by id (`GET /api/developers/{id}`) and a skill by id (`GET /api/skills/{id}`), each with its path parameter and success/error response schemas

#### Scenario: Error responses are documented

- **WHEN** a maintainer inspects a documented endpoint
- **THEN** its error responses (e.g. `400`, `404`, `409`) reference the shared `Error` schema
