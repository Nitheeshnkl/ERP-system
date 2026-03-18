#!/bin/bash

# Configuration
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
BACKEND_PORT=5000

echo "🚀 Starting Full Automation for ERP Project..."

# Helper function for opening URLs depending on the OS
open_url() {
  if command -v xdg-open > /dev/null; then
    xdg-open "$1"
  elif command -v open > /dev/null; then
    open "$1"
  else
    echo "Please open this URL manually: $1"
  fi
}

echo "========================================="
echo "🛠 Step 1: Setting up Backend & Running Tests"
echo "========================================="

cd $BACKEND_DIR
echo "📦 Installing backend dependencies..."
npm install

echo "📦 Installing testing dependencies..."
npm install -D jest supertest mongodb-memory-server

# Ensure Jest scripts are in package.json
if ! grep -q '"test:coverage"' package.json; then
  echo "Adding test scripts to backend package.json"
  npx json -I -f package.json -e 'this.scripts.test="jest"'
  npx json -I -f package.json -e 'this.scripts["test:coverage"]="jest --coverage"'
fi

echo "🧪 Running backend tests with coverage..."
npm run test:coverage

cd ..

echo "========================================="
echo "🛠 Step 2: Setting up Frontend & Running Tests"
echo "========================================="

cd $FRONTEND_DIR
echo "📦 Installing frontend dependencies..."
npm install

echo "📦 Installing frontend testing dependencies..."
npm install -D jest @testing-library/react @testing-library/jest-dom ts-jest jest-environment-jsdom identity-obj-proxy

# Ensure Jest scripts are in package.json
if ! grep -q '"test:coverage"' package.json; then
  echo "Adding test scripts to frontend package.json"
  npx json -I -f package.json -e 'this.scripts.test="jest"'
  npx json -I -f package.json -e 'this.scripts["test:coverage"]="jest --coverage"'
fi

echo "🧪 Running frontend tests with coverage..."
npm run test:coverage

cd ..

echo "========================================="
echo "🌐 Step 3: Starting Backend Server"
echo "========================================="

cd $BACKEND_DIR
echo "🚀 Starting backend server in the background..."
npm run dev &
BACKEND_PID=$!
cd ..

echo "⏳ Waiting for server to start (5 seconds)..."
sleep 5

echo "========================================="
echo "📊 Step 4: Displaying Outputs"
echo "========================================="

# Get absolute paths to the coverage reports
ABS_PATH=$(pwd)
BACKEND_COVERAGE="file://$ABS_PATH/$BACKEND_DIR/coverage/lcov-report/index.html"
FRONTEND_COVERAGE="file://$ABS_PATH/$FRONTEND_DIR/coverage/lcov-report/index.html"
SWAGGER_URL="http://localhost:$BACKEND_PORT/api-docs"

echo "📂 Opening Backend Coverage Report..."
open_url "$BACKEND_COVERAGE"

echo "📂 Opening Frontend Coverage Report..."
open_url "$FRONTEND_COVERAGE"

echo "🌐 Opening Swagger API Documentation..."
open_url "$SWAGGER_URL"

echo "✅ Automation complete. The backend server is running in the background (PID: $BACKEND_PID)."
echo "To stop the backend server later, run: kill $BACKEND_PID"
