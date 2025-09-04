FROM node:18-alpine

# Force Railway to rebuild with postinstall fixes - 2025-09-04

# Install system dependencies
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    bash \
    git \
    python3 \
    make \
    g++

WORKDIR /app

# Set npm configuration for better performance in Docker
RUN npm config set fund false
RUN npm config set audit-level none

# Copy package files first
COPY package.json package-lock.json* ./

# Set environment variables for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_DATABASE_VALIDATION=true
ENV SKIP_ENV_VALIDATION=true

# Install dependencies with better error handling
# Skip scripts to avoid postinstall issues with Prisma
RUN npm cache clean --force && \
    npm install --legacy-peer-deps --no-audit --no-fund --ignore-scripts || \
    (echo "npm install failed, trying with different flags" && \
     npm install --legacy-peer-deps --no-shrinkwrap --no-audit --no-fund --ignore-scripts)

# Copy source code (including prisma directory)
COPY . .

# Generate Prisma client after copying source
RUN npx prisma generate

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set runtime environment
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["npm", "start"]
