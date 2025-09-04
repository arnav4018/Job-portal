# Use the official Node.js 18 image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Install dependencies required for Prisma and other native modules
RUN apk add --no-cache libc6-compat openssl

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
