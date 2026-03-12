#!/bin/bash
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   AI GreenGrid – Starting Full Stack  "
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Kill any existing processes
pkill -f "uvicorn" 2>/dev/null
pkill -f "node server.js" 2>/dev/null
pkill -f "python3 app.py" 2>/dev/null
sleep 1

# Start ML Service (FastAPI) on port 8000
echo "🤖 Starting ML Service (FastAPI)..."
python3 -m uvicorn api.ml_api:app --port 8000 > ml_api.log 2>&1 &
sleep 4

# Check ML service started
if curl -s http://localhost:8000/docs > /dev/null 2>&1; then
    echo "✅ ML Service running on http://localhost:8000"
else
    echo "⚠️  ML Service may still be loading... check ml_api.log"
fi

# Start Solar Energy API on port 5001
echo "☀️ Starting Solar Energy API..."
cd ../../solar-energy-api && python3 app.py > solar_api.log 2>&1 &
cd - > /dev/null
sleep 2


# Start Node.js Backend on port 3000
echo "⚡ Starting Node.js Backend..."
node server.js > server.log 2>&1 &
sleep 2

echo "✅ Backend running on http://localhost:3000"
echo "✅ Solar API running on http://localhost:5001"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Open index.html in your browser     "
echo "  API:       http://localhost:3000/api/grid/status"
echo "  Solar-API: http://localhost:5001/renewable?area=Hyderabad"
echo "  ML:        http://localhost:8000/docs    "
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

