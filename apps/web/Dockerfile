FROM node:22

WORKDIR /usr/src/app

# Copy package.json and other necessary files
COPY package.json package-lock.json* ./
COPY tsconfig*.json .
COPY .env .

# Copy the apps and libs folders
COPY apps/web ./apps/web
COPY libs/schemas ./libs/schemas

# Install deps (this installs both root and web deps)
RUN npm install --workspace=apps/web --workspace=libs/schemas --include-workspace-root=true

# Build the schemas
RUN npm run build --workspace=libs/schemas

# Start the dev server
CMD ["npm", "run", "dev", "--workspace=web"]
