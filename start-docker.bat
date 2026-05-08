@echo off
REM Start Docker services for Windows

echo Building Docker images...
docker-compose build

echo Starting services...
docker-compose up -d

echo.
echo ✅ Services started!
echo.
echo Access the application:
echo - Frontend: http://localhost:5173
echo - Backend API: http://localhost:3001
echo - PostgreSQL: localhost:5432
echo - Redis: localhost:6379
echo.
echo Check logs with: docker-compose logs -f [service_name]
