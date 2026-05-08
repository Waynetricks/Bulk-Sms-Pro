# Troubleshooting Guide

## Database Issues

### PostgreSQL Connection Refused
```bash
# Check if PostgreSQL is running
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres

# If using local PostgreSQL, ensure it's started
psql --version  # Verify installation
```

### Sequelize Sync Errors
```bash
# Database doesn't exist or wrong credentials
# Solution: Verify DATABASE_URL in .env
# Format: postgresql://user:password@localhost:5432/database_name
```

### Foreign Key Constraint Violations
```bash
# Relations between models not set up correctly
# Solution: Run docker-compose down -v to reset
docker-compose down -v
docker-compose up -d
```

## Redis Issues

### Redis Connection Timeout
```bash
# Verify Redis is running
docker-compose logs redis

# Test connection
redis-cli ping

# If not responding, restart Redis
docker-compose restart redis
```

### Queue Jobs Not Processing
```bash
# Check Redis is accepting connections
redis-cli PING

# Check for active jobs
redis-cli LLEN rsmq:active:sms-queue

# Check for failed jobs
redis-cli LLEN rsmq:failed:sms-queue

# Monitor Redis in real-time
redis-cli MONITOR
```

## SMS Provider Issues

### Twilio Errors

**Invalid Credentials**
- Verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN
- Check that TWILIO_PHONE_NUMBER is purchased/verified in Twilio
- Format check: +1234567890

**Rate Limiting**
- Adjust QUEUE_CONCURRENCY in .env (default 10)
- Twilio free account has limits
- Spread sends over time

### Africa's Talking Errors

**API Key Issues**
- Verify AFRICAS_TALKING_API_KEY is correct
- Verify AFRICAS_TALKING_USERNAME matches your account
- Use sandbox URL for testing (not production)

**Number Format**
- Numbers must include country code
- Format: +254XXXXXXXXX for Kenya, etc.

### Vonage Errors

**Authentication Failed**
- Verify VONAGE_API_KEY and VONAGE_API_SECRET
- Check credentials at Vonage dashboard
- Verify application is created in Vonage console

**Invalid Recipient**
- Must include full international format with +
- Example: +447911123456

## Frontend Issues

### Blank Page / Not Loading
```bash
# Check Vite dev server
docker-compose logs frontend

# Restart frontend service
docker-compose restart frontend

# Check browser console for errors (F12)
```

### API Requests Failing (CORS Errors)
```bash
# CORS headers not configured
# Solution: Check that backend server has CORS middleware
# This is already configured in src/index.ts

# If custom setup, ensure cors() middleware is before routes
```

### WebSocket Connection Failed
```bash
# Check WebSocket URL in frontend .env
# Should be: ws://localhost:3001 (development)

# In production, use: wss://yourdomain.com (secure WebSocket)
```

### Tailwind Styles Not Loading
```bash
# Rebuild Tailwind CSS
cd client
npm run build

# Or restart dev server
docker-compose restart frontend
```

## Backend Issues

### Server Won't Start
```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Database not ready - wait a minute after docker-compose up
# 2. Redis not ready - same as above
# 3. Port 3001 already in use - kill other processes on 3001
# 4. Environment variables not set - verify .env exists and has values
```

### Type Errors During Runtime
```bash
# Ensure TypeScript compilation succeeded
cd server
npm run build

# Check for syntax errors
npm run typecheck
```

### Routes Not Found (404)
```bash
# Verify API routes are registered
# Check server/src/routes/api.ts
# Ensure routes match frontend API calls
# Example: Frontend calls /api/campaigns
#          Backend should have app.use('/api', apiRoutes)
```

## Docker Issues

### Image Build Failures
```bash
# Clear Docker cache and rebuild
docker-compose build --no-cache

# Check for specific error in logs
docker-compose build --progress=plain
```

### Container Won't Start
```bash
# Check logs for specific error
docker-compose logs [service_name]

# Remove and recreate containers
docker-compose down
docker-compose up -d

# Rebuild if needed
docker-compose build
docker-compose up -d
```

### Port Conflicts
```bash
# Check what's using a port (macOS/Linux)
lsof -i :[port_number]

# Kill process using the port
kill -9 [PID]

# Or change ports in docker-compose.yml
```

### Out of Disk Space
```bash
# Clean up Docker
docker system prune -a
docker volume prune

# This removes unused images and volumes
```

## Performance Issues

### Slow API Responses
```bash
# 1. Check database performance
# Increase QUEUE_CONCURRENCY gradually
# Monitor CPU and memory usage

# 2. Verify Redis is responsive
redis-cli --latency

# 3. Check database connections
# Monitor with: docker-compose logs postgres
```

### High Memory Usage
```bash
# Check which process is using memory
docker stats

# Possible causes:
# 1. Too many queue jobs - reduce QUEUE_CONCURRENCY
# 2. Large result sets - add pagination/limits
# 3. Memory leak - check logs for errors
```

### Slow Database Queries
```bash
# Enable slow query log in PostgreSQL
# Or add indexes to frequently queried columns
# Check IMPLEMENTATION.md for schema

# Monitor with: docker-compose logs postgres
```

## Network Issues

### Can't Connect to Docker Services
```bash
# Check if containers are running
docker-compose ps

# Check container networking
docker-compose exec backend ping postgres

# Verify DNS resolution in container
docker-compose exec backend cat /etc/hosts
```

### External API Calls Failing
```bash
# Verify network connectivity
docker-compose exec backend ping 8.8.8.8

# Check DNS resolution
docker-compose exec backend nslookup api.twilio.com

# May need to configure Docker DNS
```

## File Permission Issues

### Can't Write to Volumes
```bash
# Fix volume permissions (Linux/Mac)
# Usually not necessary with Docker

# If issues occur:
docker-compose down -v
docker-compose up -d
```

## Debugging Tips

### Enable Verbose Logging
```bash
# Backend
# Set NODE_ENV=development in .env
# Or add DEBUG=* before npm run dev

# Frontend
# Check browser DevTools (F12)
# Network tab for API calls
# Console tab for errors
```

### Database Inspection
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d bulk_sms

# Common queries:
SELECT * FROM campaigns;
SELECT * FROM messages WHERE status = 'failed';
SELECT COUNT(*) FROM contacts;
\dt                    # List all tables
\d contacts            # Describe table structure
```

### Redis Inspection
```bash
# Connect to Redis
docker-compose exec redis redis-cli

# Common commands:
PING                   # Test connection
KEYS *                 # List all keys
GET key_name           # Get value
DEL key_name           # Delete key
MONITOR                # Watch all commands
FLUSHDB                # Clear database (DANGER!)
```

### API Testing
```bash
# Using curl
curl -X POST http://localhost:3001/api/campaigns \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","message":"Hello","recipients":["1234567890"]}'

# Or use Postman/Insomnia for GUI
```

## Getting Help

1. **Check logs first**: `docker-compose logs -f [service]`
2. **Review documentation**: README.md, IMPLEMENTATION.md
3. **Verify .env**: `cat .env | grep -v "^#"`
4. **Test individual components**:
   - Database: `psql ...`
   - Redis: `redis-cli`
   - API: `curl ...`
5. **Check SMS provider status page** for API issues
6. **Review browser console** for frontend errors

## Common Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | Service not running | Start with `docker-compose up` |
| `CORS error` | Frontend/backend mismatch | Check VITE_API_BASE_URL |
| `Invalid token` | Expired JWT | Re-login or reset token |
| `UNIQUE constraint failed` | Duplicate phone number | Check contact import |
| `Queue timeout` | Job taking too long | Increase timeout or split batch |
| `Out of memory` | Too many jobs queued | Reduce QUEUE_CONCURRENCY |
| `Webhook failed` | SMS provider unreachable | Check firewall/network |

## System Requirements Check

```bash
# Verify all requirements met
node --version              # Should be 18+
npm --version               # Should be 8+
docker --version            # Should be 20+
docker-compose --version    # Should be 1.29+
psql --version              # If using local PostgreSQL
redis-cli --version         # If using local Redis
```
