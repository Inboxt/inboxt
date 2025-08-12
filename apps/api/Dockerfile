# Base image
FROM node:22

WORKDIR /usr/src/app

# Copy package.json and other necessary files
COPY package.json .
COPY tsconfig*.json .
COPY .env .

# Copy the apps and libs folders
COPY apps/api ./apps/api
COPY libs/common ./libs/common

# Making sure that prisma (with client) is copied over to dist directory, probably this part should be improved, but for now it is needed, as the app breaks without it
COPY apps/api/prisma ./apps/api/dist/prisma

# Install dependencies
RUN npm install --workspace=apps/api --workspace=libs/common --include-workspace-root=true
#RUN npm install

# Build the schemas
RUN npm run build --workspace=libs/common

# Start the API
CMD [ "npm", "run", "start:dev", "--workspace=apps/api" ]