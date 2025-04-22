FROM node:20

WORKDIR /usr/src/app

COPY package.json .
COPY apps/api ./apps/api

# Making sure that prisma (with client) is copied over to dist directory, probably this part should be improved, but for now it is needed, as the app breaks without it
COPY apps/api/prisma ./apps/api/dist/prisma

COPY tsconfig.json .
COPY .env .

# Install workspace dependencies
RUN npm install --workspace=apps/api --include-workspace-root=true --loglevel http

# Start
CMD [ "npm", "run", "start:dev", "--workspace=apps/api" ]