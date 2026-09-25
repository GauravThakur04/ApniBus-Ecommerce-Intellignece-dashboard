#!/bin/bash
echo "=========================================================="
echo "🚀 Starting ApniBus E-Commerce Command Center"
echo "=========================================================="
echo "Backend & Frontend unified server starting on http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo "=========================================================="

export PYTHONPATH=.
./backend/venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
