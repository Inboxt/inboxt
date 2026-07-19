---
next: false
---

# Setting up local development

This guide will help you set up a local development environment for Inboxt.

## Prerequisites

- [Node.js](https://nodejs.org/) (v20 or newer recommended)
- [npm](https://www.npmjs.com/) (v10 or newer)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/)

## Clone the repository

```bash
git clone https://github.com/Inboxt/inboxt.git
cd inboxt
```

## Setup environment variables

Copy the local development environment file:

```bash
cp dev.env.example .env
```

The default values in `dev.env.example` are pre-configured to work with the Docker Compose infrastructure.

## Install dependencies

From the root of the monorepo:

```bash
npm install
```

## Running the development environment

The simplest way to start developing is by using the pre-configured Docker Compose setup for infrastructure (PostgreSQL, Valkey, Mailpit) while running the apps locally.

### Start infrastructure and backend

```bash
npm run dev
```

This command uses `concurrently` to:
1. Start infrastructure services via `docker-compose.dev.yml`.
2. Start the frontend web app.

> [!NOTE]
> The backend API is built into the Docker image in `docker-compose.dev.yml` for consistency.

### Apps and Ports

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:7000/api](http://localhost:7000/api) (The core API, including "Hello World" and webhook endpoints)
- **GraphQL Playground:** [http://localhost:7000/api/graphql](http://localhost:7000/api/graphql) (For direct schema exploration)
- **Mailpit UI (Local Email):** [http://localhost:8025](http://localhost:8025)

### Default User

When you run the seed script (`npm run api:docker:seed`), a default demo account is created:

- **Email:** `default@inboxt.app`
- **Password:** `Password1@`

## Common Commands

### Database Migrations

Inboxt uses `node-pg-migrate` for database migrations (using its **programmatic TypeScript API**) and `Prisma` as an ORM.

- **Create a new migration:** `npm run migrate:create --workspace=apps/api <name>`
- **Run migrations (up):** `npm run api:migrate:up`
- **Rollback migrations (down):** `npm run migrate:down --workspace=apps/api`
- **Generate Prisma client:** `npm run api:docker:generate`

### Type Checking and Linting

- **Type Check:** `npm run type:check-api`, `npm run type:check-web`
- **Lint:** `npm run lint:api`, `npm run lint:web`

## Developing the Browser Extension

To develop the browser extension:

```bash
npm run dev:extension
```

This will start the extension development server. WXT will **automatically launch a pre-loaded browser instance** for you with the extension enabled.
 
### Developing the Documentation
 
To run the documentation site locally:
 
```bash
npm run docs:dev
```
 
The docs will be available at [http://localhost:5173](http://localhost:5173).
 
> [!IMPORTANT]
> To use the extension's save features, you must have the Inboxt infrastructure (API and DB) running. It is recommended to run `npm run dev` from the root first, as the extension communicates with your local instance.

If you need to manually load it for any reason, follow the instructions in `apps/web-extension/README.md`.