FROM node:22

WORKDIR /usr/src/app

# Copy package.json and other necessary files
COPY package.json package-lock.json* ./
COPY tsconfig*.json .
COPY .env .

# Copy the apps and libs folders
COPY apps/web ./apps/web
COPY libs/common ./libs/common

# Install deps (this installs both root and web deps)
RUN npm install --workspace=apps/web --workspace=libs/common --include-workspace-root=true

# Build the schemas
RUN npm run build --workspace=libs/common

# Start the dev server
CMD ["npm", "run", "dev", "--workspace=web"]
