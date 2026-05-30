FROM node:20-alpine AS builder
WORKDIR /build
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/src ./src
COPY --from=builder /build/dist ./public

EXPOSE ${PORT:-4010}

CMD ["node", "src/index.js"]
