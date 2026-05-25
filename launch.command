#!/bin/bash
cd "$(dirname "$0")"

# Kill anything already running on these ports
lsof -ti:3001,5173 | xargs kill -9 2>/dev/null

echo "Starting ReportyCharty..."
npm run dev &
NPM_PID=$!

echo "Waiting for app to start..."
until curl -s http://localhost:5173 > /dev/null 2>&1; do
    sleep 1
done

open http://localhost:5173
echo "ReportyCharty is running. Close this window to stop."

wait $NPM_PID
