# Quick Start Guide

## Running with Docker (Recommended)

### Windows
```bash
# Run setup
setup.bat

# Start Docker services
start-docker.bat
```

### macOS / Linux
```bash
# Run setup
chmod +x setup.sh
./setup.sh

# Start Docker services
chmod +x start-docker.sh
./start-docker.sh
```

Once started, access:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Database**: PostgreSQL on localhost:5432
- **Cache**: Redis on localhost:6379

## Manual Setup (Without Docker)

### Prerequisites
- Node.js 18+
- PostgreSQL running locally
- Redis running locally

### Steps

1. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start backend** (Terminal 1)
   ```bash
   cd server
   npm install
   npm run dev
   ```

4. **Start frontend** (Terminal 2)
   ```bash
   cd client
   npm install
   npm run dev
   ```

Frontend runs on http://localhost:5173
Backend runs on http://localhost:3001

## Configuration

Update `.env` with:
- **Database**: PostgreSQL connection string
- **Redis**: Redis connection URL
- **SMS Provider**: Choose twilio, africas_talking, or vonage
- **Provider Credentials**: Your provider's API keys and tokens

## Building for Production

```bash
# Build Docker images
docker-compose build

# Or build manually
cd server && npm run build
cd ../client && npm run build
```

## Troubleshooting

### Database issues?
```bash
docker-compose down -v  # Remove volumes
docker-compose up -d    # Restart fresh
```

### Need to reset?
```bash
# Stop all services
docker-compose stop

# Remove containers and data
docker-compose down -v

# Start fresh
docker-compose up -d
```

### Check logs
```bash
docker-compose logs -f [service_name]
```

## API Documentation

See [README.md](./README.md) for full API endpoint documentation.
