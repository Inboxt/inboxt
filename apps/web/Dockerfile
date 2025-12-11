FROM node:24

WORKDIR /usr/src/app

# Copy package.json and other necessary files
COPY package.json package-lock.json* ./
COPY tsconfig*.json .
COPY .env .

# Copy the apps and libs folders
COPY apps/web ./apps/web
COPY libs/common ./libs/common
COPY libs/ui ./libs/ui
COPY libs/graphql ./libs/graphql

# Install dependencies
RUN npm install --workspace=apps/web --workspace=libs/ui --workspace=libs/graphql --include-workspace-root=true

# Build libs packages
RUN npm run build --workspace=libs/common

# Start the dev server
CMD ["npm", "run", "dev", "--workspace=web"]
