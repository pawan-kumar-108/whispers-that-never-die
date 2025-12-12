#!/bin/bash

# Patchwork Startup Script
# This script activates the virtual environment and starts the application

echo "🌸 Starting Patchwork..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please run: python3 -m venv venv"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file with your COHERE_API_KEY"
    exit 1
fi

# Activate virtual environment
echo "✓ Activating virtual environment..."
source venv/bin/activate

# Check if dependencies are installed
if ! python -c "import flask" 2>/dev/null; then
    echo "⚠️  Dependencies not installed. Installing now..."
    pip install -r backend/requirements.txt
fi

echo "✓ Dependencies loaded"
echo ""
echo "🚀 Starting Patchwork server..."
echo "📍 Access the app at: http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo ""

# Run the application
python backend/app.py
