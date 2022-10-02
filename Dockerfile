
FROM node:lts-buster-slim

WORKDIR /app
COPY package*.json ./
RUN npm install production
COPY ./dist ./dist
COPY ./views ./views

EXPOSE 80
CMD ["node", "dist/server/server.js"]
