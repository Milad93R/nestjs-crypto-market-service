#!/bin/sh

# Start the application in development mode in the background
npm run start:dev &

# Store the PID of the Node.js process
NODE_PID=$!

# Wait for the application to be ready
echo "Waiting for application to start..."
sleep 10

# Check if initialization is enabled
if [ "$INIT_DB" = "true" ]; then
    echo "Initializing database..."
    # Try to initialize the database
    curl -X POST http://localhost:3000/api/v1/init
    
    # Check if initialization was successful
    if [ $? -eq 0 ]; then
        echo "Database initialization completed successfully"
    else
        echo "Failed to initialize database"
        kill $NODE_PID
        exit 1
    fi
else
    echo "Skipping database initialization (INIT_DB is not set to true)"
fi

# Wait for the Node.js process to finish
wait $NODE_PID 