#!/bin/bash
# Development startup script for TinyTroupe Nx monorepo

set -e # Exit on any error

echo "🚀 Starting TinyTroupe Development Environment..."

# Check if we're in the right directory
if [ ! -f "nx.json" ]; then
    echo "❌ Error: Please run this script from the root of the TinyTroupe repository"
    exit 1
fi

# Check if required dependencies are installed
echo "📦 Checking dependencies..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is required but not installed"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is required but not installed"
    exit 1
fi

# Check if Python dependencies are installed
echo "   Checking Python dependencies..."
if ! python3 -c "import uvicorn, fastapi, tinytroupe" 2>/dev/null; then
    echo "   Installing Python dependencies..."
    cd apps/api
    if [ -f "requirements.txt" ]; then
        python3 -m pip install -r requirements.txt
    else
        echo "❌ Error: requirements.txt not found in apps/api/"
        exit 1
    fi
    cd ../..
fi

# Check if Node dependencies are installed
echo "   Checking Node.js dependencies..."
if [ ! -d "node_modules" ] || [ ! -d "apps/web/node_modules" ]; then
    echo "   Installing Node.js dependencies..."
    npm install
fi

# Create .env file for API if it doesn't exist
if [ ! -f "apps/api/.env" ]; then
    echo "📝 Creating API environment file..."
    if [ -f "apps/api/.env.example" ]; then
        cp apps/api/.env.example apps/api/.env
        echo "⚠️  Please update apps/api/.env with your OpenAI API key!"
    else
        echo "Creating minimal .env file..."
        cat > apps/api/.env << 'EOF'
# TinyTroupe API Configuration
OPENAI_API_KEY=your_openai_api_key_here
TINYTROUPE_ROOT_PATH=../../packages/tinytroupe-original

# Optional: Uncomment and configure if needed
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
# AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
# AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint_here
EOF
        echo "⚠️  Created apps/api/.env - Please update with your API keys!"
    fi
fi

# Check if .env has been configured
if grep -q "your_openai_api_key_here" apps/api/.env; then
    echo "⚠️  Warning: Please update your OpenAI API key in apps/api/.env"
    echo "   The API will not work without a valid API key."
fi

echo ""
echo "🎯 Starting services..."
echo "   API: http://localhost:8000"
echo "   Web: http://localhost:3000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📝 Useful commands while running:"
echo "   - Test API health: curl http://localhost:8000/health"
echo "   - View API logs: Check terminal output"
echo "   - Frontend logs: Check browser console"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    jobs -p | xargs -r kill
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start API server in background
echo "🐍 Starting FastAPI server..."
cd apps/api
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
API_PID=$!
cd ../..

# Wait a moment for API to start
sleep 2

# Start Next.js frontend in background
echo "⚛️  Starting Next.js frontend..."
cd apps/web
npm run dev &
WEB_PID=$!
cd ../..

echo ""
echo "✅ Services started successfully!"
echo "   API PID: $API_PID"
echo "   Web PID: $WEB_PID"
echo ""

# Wait for both background processes
wait