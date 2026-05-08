# CI/CD and Deployment Configuration

This file contains guidance for deploying the Bulk SMS application.

## Docker Production Build

```bash
# Build production images
docker-compose -f docker-compose.yml build

# Start services
docker-compose up -d
```

## Environment Setup for Production

1. Copy `.env.example` to `.env.production`
2. Update all production values:
   - Set `NODE_ENV=production`
   - Use production database credentials
   - Update Redis connection for production
   - Add real SMS provider credentials
   - Generate strong JWT secret
   - Set webhook secret for SMS providers

## Health Checks

- Backend: `GET /health`
- Database: Automatically checked on startup
- Redis: Connection verified in queue module

## Monitoring

- Enable Docker logs: `docker-compose logs -f [service]`
- Check application startup: Backend logs should show "Server running on port 3001"
- Verify queue processing: Check Redis for active jobs

## Scaling Considerations

- Increase `QUEUE_CONCURRENCY` for more parallel SMS sends
- Use database connection pooling
- Consider Redis cluster for high-volume queue processing
- Load balance frontend across multiple instances
