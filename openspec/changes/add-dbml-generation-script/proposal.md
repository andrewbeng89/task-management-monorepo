## Why

The backend defines its data model in `prisma/schema.prisma`, but there is no shared, visual representation of the entity relationships for onboarding, design reviews, or documentation. A DBML file can be committed alongside the schema and rendered on dbdiagram.io (or similar) to give the team an always-current ER diagram derived directly from the source of truth.

## What Changes

- Add a new npm script to the backend project (e.g. `db:dbml`) that generates a DBML file representing the database entity relationships from the Prisma schema.
- Introduce the tooling/dependency needed to convert the Prisma schema into DBML.
- Produce a committed DBML output file (e.g. `prisma/dbml/schema.dbml`) capturing all models, enums, relations, and join tables.
- Document how to run the script and where the output lives.

## Capabilities

### New Capabilities
- `dbml-generation`: Generate a DBML file from the backend Prisma schema via an npm script, keeping the ER diagram in sync with the database model.

### Modified Capabilities
<!-- None: no existing spec requirements change. -->

## Impact

- **Code/config**: `backend/package.json` (new script + devDependency), Prisma generator configuration in `backend/prisma/schema.prisma` or a standalone generation script.
- **Dependencies**: Adds a Prisma-to-DBML tooling dependency (e.g. `prisma-dbml-generator` or `@dbml/core` + Prisma DMMF), verified against Prisma 7.
- **Output**: New generated artifact under `backend/prisma/dbml/`.
- **No runtime impact**: build/dev-time tooling only; does not affect the running API or database.
