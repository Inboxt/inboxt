# Inboxt Web

The frontend for Inboxt, built with **React**, **Vite**, and **Mantine**. It uses **TanStack Router** for typesafe routing and **Apollo Client** for GraphQL data fetching.

## Development

### Prerequisites

1.  Ensure the infrastructure (API, DB, Valkey) is running via the monorepo root:
    ```bash
    npm run dev
    ```
2.  Install dependencies in the root: `npm install`

### Running Locally

To start the web app development server:
```bash
npm run dev --workspace=apps/web
```

The app will be available at `http://localhost:3000`.

### GraphQL Code Generation

Whenever the GraphQL schema changes in the API, you must update the generated types in the web app to maintain type safety:
```bash
npm run codegen
```
This runs `@graphql-codegen/cli` and updates the types used by Apollo Client.

## Configuration

The frontend uses environment variables prefixed with `VITE_`.

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_URL` | The URL of the GraphQL API endpoint. | `http://localhost:7000/api/graphql` |
| `VITE_WEB_URL` | The base URL of the web app itself. | `http://localhost:3000` |

## Deployment Notes

The web app is built as a static site. In production, it is served by the NestJS backend via `@nestjs/serve-static`.

To build the static files:
```bash
npm run build --workspace=apps/web
```
