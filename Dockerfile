# Use Node.js 20 as the base image
FROM node:20-alpine

# Install curl for health checks and initialization
RUN apk add --no-cache curl

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Make the startup script executable
RUN chmod +x src/scripts/start.sh

# List the contents of dist directory
RUN ls -la dist/

# Expose port
EXPOSE 3000

# Use the startup script as the entry point
CMD ["./src/scripts/start.sh"]