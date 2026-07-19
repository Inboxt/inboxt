# Inboxt Documentation

This directory contains the source code for the official [Inboxt Documentation](https://docs.inboxt.app), built using **VitePress**.

## Local Development

### Start Development Server
Use this for real-time previewing with Hot Module Replacement (HMR) as you edit Markdown files. Run this from the **root of the monorepo**:

```bash
npm run docs:dev
```

The site will be available at [http://localhost:5173](http://localhost:5173).

### Build & Preview
Use this to check the final static production build locally.

```bash
# Build the static site
npm run docs:build

# Preview the build locally (from docs directory)
cd docs && npm run preview
```

## Contributing to Docs

We welcome improvements to Inboxt's documentation! Whether it's fixing a typo, improving a guide (self-hosting, local development, etc.), or documenting a core feature (saving articles, managing newsletters, or organizing content).

- **Source files:** All guides are located in the `docs/content/` directory as Markdown files.
- **Config:** The site structure and navigation are defined in `docs/.vitepress/config.mts`.
- **Static Assets:** Static files (favicons, etc.) are in `docs/content/public/`.

## License

The documentation in this directory is licensed under the **MIT License**.

The Inboxt application source code in the rest of this repository is licensed separately under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.
