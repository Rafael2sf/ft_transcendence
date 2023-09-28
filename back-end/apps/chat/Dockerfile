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

CMD ["npm", "run", "start:dev", "chat"]

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
COPY --chown=node:node apps/chat/ ./apps/chat/

# Compile
RUN npm run build chat

###
FROM node:18-alpine as prod

# Optimizations
ENV NODE_ENV=production

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000

# Launch 
CMD ["npm", "run", "start:prod", "dist/apps/chat/main"]
