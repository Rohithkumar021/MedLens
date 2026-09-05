# ==========================================
# Stage 1: Build Frontend (React + Vite)
# ==========================================
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Production Python Backend Container
# ==========================================
FROM python:3.13-slim

# Prevent Python from writing .pyc files & enable unbuffered logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HOST=0.0.0.0

WORKDIR /app

# Install system dependencies if required for fonts/pdf
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python backend dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend application code
COPY backend/ ./backend/
COPY pytest.ini ./pytest.ini

# Copy built frontend static assets from builder stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose container port
EXPOSE 8000

# Start production server listening on 0.0.0.0:$PORT
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}

