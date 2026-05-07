#!/bin/bash
# Aevum AI Setup Script for Linux/Mac

echo ""
echo "========================================="
echo "  Aevum AI - Event Publicity Agent"
echo "  Setup Script for Linux/Mac"
echo "========================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    exit 1
fi

echo "✓ Python found"
python3 --version

# Create virtual environment
echo ""
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
python3 -m pip install --upgrade pip

# Install dependencies
echo ""
echo "Installing dependencies..."
pip install -r requirements.txt

# Initialize database
echo ""
echo "Initializing database..."
cd backend
python3 database.py
cd ..

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠  Please edit .env and add your API keys:"
    echo "   - GEMINI_API_KEY"
    echo "   - GOOGLE_CREDENTIALS_PATH"
    echo "   - GOOGLE_CALENDAR_ID"
    echo "   - SMTP credentials"
fi

echo ""
echo "========================================="
echo "   Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "   1. source venv/bin/activate"
echo "   2. Edit .env with your API keys"
echo "   3. cd backend && python -m uvicorn main:app --reload --port 8000"
echo "   4. Visit: http://localhost:8000/docs"
echo ""
