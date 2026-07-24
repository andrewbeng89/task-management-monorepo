## ADDED Requirements

### Requirement: Root README documents the project

The repository SHALL provide a root-level `README.md` that documents the project for contributors. It SHALL include, at minimum, sections covering: an overview of the app and monorepo layout, the tech stack, local development setup, engineering/architectural decisions, and MVP assumptions.

#### Scenario: README exists at the repository root

- **WHEN** a contributor opens the repository root
- **THEN** a `README.md` is present with clearly delineated sections for Overview, Tech stack, Local development setup, Engineering/architectural decisions, and Assumptions (MVP)

#### Scenario: Tech stack section

- **WHEN** a reader views the Tech stack section
- **THEN** it lists the backend stack, the frontend stack, and the shared tooling used in the monorepo

#### Scenario: Local development setup section

- **WHEN** a reader follows the Local development setup section
- **THEN** it describes prerequisites, installation, environment configuration, how to run the stack (via Docker Compose and/or the workspaces directly), and how to provision the database
- **AND** the commands it references exist in the repository (e.g. root and workspace `package.json` scripts)

#### Scenario: Architectural decisions section is a labelled draft

- **WHEN** a reader views the Engineering/architectural decisions section
- **THEN** it summarizes notable decisions and is explicitly marked as a draft to be refined later

#### Scenario: MVP assumptions section

- **WHEN** a reader views the Assumptions (MVP) section
- **THEN** it states the intentional MVP simplifications, including that there is no authentication/login or user accounts and that concurrent-user conflicts are not specially handled
