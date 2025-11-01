# Multi-stage Dockerfile for Restaurant Booking Frontend
# Stage 1: Build - Build with Vite
# Stage 2: Runtime - Serve static files with Nginx

# Build stage - Build with Vite
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY vite.config.js ./

# Install dependencies
RUN npm install

# Copy source files
COPY src/ ./src/
COPY public/ ./public/

# Build with Vite
RUN npm run build

# Runtime stage - Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built files from build stage
COPY --from=build /app/dist/ ./

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
