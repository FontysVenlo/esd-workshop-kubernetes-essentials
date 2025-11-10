# Backend/Dockerfile
FROM node:22-alpine

WORKDIR /app


COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build && npm ci --omit=dev

RUN mkdir -p /data

ENV PORT=8080 APP_VERSION=1.0.0 DB_PATH=/data/demo.sqlite
EXPOSE 8080

CMD ["npm", "start"]
