# Contributing

Thank you for your interest in contributing! We are happy that you are looking to improve Inboxt.

## Ways to contribute

1. **Bug Reports & Feature Requests:** If you find a bug or have an idea, please [open an issue](https://github.com/Inboxt/inboxt/issues) or start a [discussion](https://github.com/Inboxt/inboxt/discussions).
2. **Code:** Bug fixes, small improvements, and even major features are welcome.
3. **Documentation:** Documentation is just as important as code. Improving guides or fixing typos is always appreciated.

## High-Level Architecture

Inboxt is a monorepo that shares logic and UI components across the backend, web app, and browser extension.

### The Mental Model
- **Content Pipeline:** The browser extension (or the email webhook) sends data to the API.
- **Background Jobs:** The API uses **BullMQ** to handle heavy lifting (like HTML parsing and content extraction) in the background to keep the API responsive.
- **Shared Truth:** All TypeScript types and validation schemas are defined in `libs/common`. This ensures that if a field changes in the backend, the frontend will catch the error at compile-time.

## Directory Tour

### `apps/api` (NestJS)
- `src/modules`: Feature-based logic (Auth, Inboxes, Saved Items, etc.).
- `src/managers`: BullMQ job processors for background tasks.
- `prisma`: Database schema and migrations.

### `apps/web` (React + Vite)
- `src/routes`: Page components and routing logic using **TanStack Router**.
- `src/components`: UI components specific to the web app.
- `src/hooks`: Custom React hooks for data fetching and state management.

### `libs/` (Shared)
- `libs/common`: Shared types, Zod schemas, and utility functions.
- `libs/ui`: Shared React components and the base Mantine theme.

### `docs/`
- `content/`: Markdown source files for the documentation.
- `content/public/`: Static assets (favicons, manifest, etc.).
- `.vitepress/`: VitePress configuration and theme customization.

## Development Workflow

### Database Changes
If you need to add or modify a database field:
1. Update `apps/api/prisma/schema.prisma`.
2. Create a new migration: `npm run migrate:create --workspace=apps/api <migration-name>`.
3. In the newly created file (`apps/api/migrations/...`), use the **programmatic `node-pg-migrate` API** (e.g., `pgm.createTable`, `pgm.addColumn`) to define your changes in TypeScript.
4. Run `npm run api:migrate:up` from the root to apply the change to your local database.
5. Run `npm run api:docker:generate` to update the Prisma client.
6. If the change affects the GraphQL API, run `npm run codegen` in the web app to update frontend types.

### UI & Styling
We use **Mantine** for our UI.
- **Avoid hardcoding** colors, spacing, or complex inline CSS. Use Mantine **theme tokens** (e.g., `theme.colors.blue[6]`) or **Style Props** (e.g., `bg="blue.6"`, `p="md"`, `mt="xl"`) directly on components.
- **Minimize CSS Modules:** Only use CSS modules when absolutely necessary for complex animations or overrides that cannot be handled via Mantine's built-in props.
- **No Inline Styles:** Avoid using the `style={...}` prop for general layout and styling. Prefer Mantine components and their utility props.
 - If a component is used in both the web app and the extension, it belongs in `libs/ui`.
 
 ## Getting started with development
 
 Before you start coding, please read our [Local Development Guide](/local-development) to set up your environment.
 
 ### Branching Strategy
 
 - **`master`:** The stable branch. Production releases are tagged here.
 - For your own changes, create a feature branch from `master` (e.g., `feat/my-new-feature`).
 
 ### Commit Conventions
 
 We follow a simple commit convention:
 - `feat:` for new features
 - `fix:` for bug fixes
 - `docs:` for documentation changes
 - `chore:` for routine tasks, dependencies, etc.
 - `refactor:` for code changes that neither fix a bug nor add a feature
 
 ## Pull Request Process
 
 1. **Fork and Branch:** Fork the repository and create a new branch for your change.
 2. **Commit:** Write clear, descriptive commit messages.
 3. **Open a PR:** Once you’re ready, open a Pull Request.
 4. **Discussion:** Be prepared to discuss your changes and make improvements based on feedback.
 
 > [!TIP]
 > For larger changes, it's a good idea to discuss them in a GitHub discussion or issue before you start implementation. This ensures your work aligns with the project's goals.
 
 ## Code of conduct
 
 Be respectful, constructive, and kind. The goal is to build a useful tool for managing digital content.