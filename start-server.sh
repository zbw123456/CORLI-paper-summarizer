#!/bin/bash

# Paper Summarizer - Pure JavaScript Edition
# Quick Start Server

PORT=${1:-8000}

echo "🚀 Paper Summarizer is starting..."
echo "📍 Open your browser: http://localhost:$PORT"
echo "🛑 Press Ctrl+C to stop"

# Try different server commands (with runtime fallback)
if command -v npx &> /dev/null; then
    npx --yes http-server -p "$PORT" && exit 0
fi

if command -v python3 &> /dev/null; then
    python3 -m http.server "$PORT" && exit 0
fi

if command -v python &> /dev/null; then
    python -m http.server "$PORT" && exit 0
fi

echo "Error: No working HTTP server runtime found (python3/python/npx)."
exit 1
