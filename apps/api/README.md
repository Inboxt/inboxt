# Inboxt API

The backend for Inboxt, built with **NestJS**, **PostgreSQL**, and **BullMQ**. It uses **Prisma** for type-safe data access and **node-pg-migrate** for migrations.

## Development

### Running the API

The API requires PostgreSQL and Valkey. For development consistency, the API is built and run inside Docker alongside its dependencies.

To start everything from the monorepo root:
```bash
npm run dev
```

The API will be accessible at:
- **Base API:** `http://localhost:7000/api` (includes health check and webhooks)
- **GraphQL:** `http://localhost:7000/api/graphql` (Playground available)

### Useful Commands

These commands should typically be run from the root using the `--workspace=apps/api` flag (or via root shortcuts in `package.json`):

- `npm run migrate:up`: Apply database migrations.
- `npm run migrate:create`: Create a new TypeScript migration file.
- `npm run db:seed`: Seed the database with the default demo user.
- `npm run prisma:generate`: Update the Prisma client (run after migration changes).

## Authentication

For local development, the database is seeded with a default user:
- **Email:** `default@inboxt.app`
- **Password:** `Password1@`

## Folder Structure

- `src/modules`: Feature-based logic (Auth, Inboxes, Items, etc.).
- `src/managers`: BullMQ job processors.
- `src/common`: Shared guards, filters, and utilities.
- `prisma`: Database schema definition and seed scripts.
- `migrations`: Programmatic TypeScript migration files.
