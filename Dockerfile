FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    bash

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Set environment variables for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_DATABASE_VALIDATION=true
ENV SKIP_ENV_VALIDATION=true

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Clean up dev dependencies to reduce image size
RUN npm prune --production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Set runtime environment
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["npm", "start"]
