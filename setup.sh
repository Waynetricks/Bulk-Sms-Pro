#!/bin/bash

# Bulk SMS Application Setup Script

set -e

echo "🚀 Bulk SMS Application Setup"
echo "=============================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📋 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your SMS provider credentials."
    echo ""
    read -p "Press enter to continue after updating .env..."
fi

echo "📦 Installing dependencies..."

# Install root dependencies
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your SMS provider credentials"
echo "2. Run 'docker-compose up -d' to start services"
echo "   OR"
echo "3. Run 'npm run dev' to start both frontend and backend"
echo ""
