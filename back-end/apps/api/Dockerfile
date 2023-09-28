FROM node:18-alpine as dev

WORKDIR /usr/src/app

ENV NODE_ENV=development

# Copy metadata files
COPY --chown=node:node *.json ./

# Copy prisma to generate before mouting
COPY --chown=node:node apps/prisma ./prisma

# Generate files
RUN npm install --loglevel verbose
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start:migrate:dev", "api"]

###
FROM node:18-alpine as build

# Create app directory
WORKDIR /usr/src/app

# Copy metadata files
COPY --chown=node:node *.json ./
COPY --chown=node:node apps/prisma ./prisma

# Install app dependencies
RUN npm ci
RUN npx prisma generate

# Bundle app source
COPY --chown=node:node apps/api/ ./apps/api/

# Compile
RUN npm run build api

###
FROM node:18-alpine as prod

# Optimizations
ENV NODE_ENV=production

COPY --from=build /usr/src/app/prisma ./prisma
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000

# Launch
CMD ["npm", "run", "start:migrate:prod", "dist/apps/api/main"]
