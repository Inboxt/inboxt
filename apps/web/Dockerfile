FROM node:20

WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
COPY apps/web ./apps/web

COPY tsconfig*.json .
COPY .env .

# Install deps (this installs both root and web deps)
RUN npm install --workspace=apps/web --include-workspace-root=true

# Start the dev server
CMD ["npm", "run", "dev", "--workspace=web"]
