FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    bash \
    git

WORKDIR /app

# Set npm configuration for better performance in Docker
RUN npm config set fund false
RUN npm config set audit-level none

# Copy package files
COPY package.json package-lock.json* ./

# Clean npm cache and install dependencies
RUN npm cache clean --force
# Use npm install instead of npm ci to avoid checksum issues
RUN npm install --production=false --no-optional --no-audit --no-fund

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
