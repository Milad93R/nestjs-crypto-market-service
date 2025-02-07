# Use Node.js 20 as the base image
FROM node:20-alpine

# Install curl for health checks and initialization
RUN apk add --no-cache curl dos2unix

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Fix line endings in start.sh
RUN dos2unix src/scripts/start.sh && chmod +x src/scripts/start.sh

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application using the shell script
CMD ["sh", "src/scripts/start.sh"]