# dbml-generation Specification

## Purpose

Provide a repeatable, documented way to generate a DBML (Database Markup Language) file from the backend Prisma schema so the database's entity-relationship model can be rendered as a diagram and kept in sync with the schema.

## Requirements

### Requirement: DBML generation npm script

The backend project SHALL provide an npm script that generates a DBML file representing the database entity relationships derived from the Prisma schema (`prisma/schema.prisma`).

#### Scenario: Generate DBML from the Prisma schema

- **WHEN** a developer runs the DBML generation npm script from the `backend` directory
- **THEN** the command completes successfully (exit code 0) and writes a DBML file to a deterministic path under `backend/prisma/`

#### Scenario: Generation without a live database connection

- **WHEN** the DBML generation script is run without a reachable database
- **THEN** the script still produces the DBML file, because generation reads from the Prisma schema definition rather than introspecting a running database

### Requirement: DBML output reflects the data model

The generated DBML file SHALL represent all models, enums, and relationships defined in the Prisma schema, so the output can be rendered as an entity-relationship diagram.

#### Scenario: Tables and columns are represented

- **WHEN** the DBML file is generated from the current schema
- **THEN** it contains a table for each Prisma model (`Developer`, `Skill`, `DeveloperSkill`, `TaskSkill`, `Task`) using their mapped table names, with their columns and types

#### Scenario: Enums are represented

- **WHEN** the DBML file is generated
- **THEN** it contains the `TaskStatus` enum with its values (`TODO`, `IN_PROGRESS`, `DONE`)

#### Scenario: Relationships and join tables are represented

- **WHEN** the DBML file is generated
- **THEN** it captures the foreign-key relationships, including the many-to-many join tables (`developer_skills`, `task_skills`) and the self-referencing parent/child relationship on `Task`

### Requirement: Repeatable and documented generation

The DBML generation SHALL be repeatable and its usage documented so the output stays in sync with the schema.

#### Scenario: Regenerating produces consistent output

- **WHEN** the script is run multiple times against an unchanged schema
- **THEN** the generated DBML file content is stable (no spurious differences between runs)

#### Scenario: Usage is discoverable

- **WHEN** a developer inspects `backend/package.json`
- **THEN** the DBML generation script is listed with a clear name, and how to run it plus the output location are documented
