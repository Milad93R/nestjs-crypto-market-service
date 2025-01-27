# Use Node.js 20 as the base image
FROM node:20-alpine

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
RUN ls -la dist/

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/src/main"]