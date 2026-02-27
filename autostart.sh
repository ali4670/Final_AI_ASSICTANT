#!/bin/bash

# Navigate to the project directory
cd /mnt/d/Final_AI_ASSICTANT-main

# Start the Backend and Frontend using concurrently (as defined in your project)
# We run this in the background so the script can continue
npx concurrently "npm run dev" "node server/index.js" &

# Wait 8 seconds for the servers to warm up
sleep 8

# Open the default web browser to the local address
xdg-open http://localhost:5173
