# Multi-stage build
# Stage 1: Build frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app/client

# Install pnpm
RUN npm install -g pnpm

COPY client/package*.json ./
RUN pnpm install

COPY client/ ./
RUN pnpm build

# Stage 2: Build backend
FROM node:22-alpine AS backend-builder

WORKDIR /app/server

# Install pnpm
RUN npm install -g pnpm

COPY server/package*.json ./
RUN pnpm install

COPY server/ ./
RUN pnpm build

# Stage 3: Production image
FROM node:22-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy built backend
COPY --from=backend-builder /app/server/dist ./server/dist
COPY --from=backend-builder /app/server/node_modules ./server/node_modules
COPY --from=backend-builder /app/server/package*.json ./server/

# Copy built frontend
COPY --from=frontend-builder /app/client/dist ./client/dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/dist/index.js"]
