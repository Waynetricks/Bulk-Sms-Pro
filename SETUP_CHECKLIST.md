# Bulk SMS Application - Setup Verification Checklist

## Pre-Installation

- [ ] Node.js 18+ installed (`node --version`)
- [ ] Docker and Docker Compose installed (`docker --version`, `docker-compose --version`)
- [ ] PostgreSQL 15+ available (local or Docker)
- [ ] Redis 7+ available (local or Docker)
- [ ] Valid SMS provider account (Twilio, Africa's Talking, or Vonage)

## Installation Steps

- [ ] Clone/download project
- [ ] Navigate to project root: `cd bulk-sms`
- [ ] Copy env file: `cp .env.example .env`
- [ ] Update .env with SMS provider credentials:
  - [ ] Choose SMS_PROVIDER (twilio, africas_talking, or vonage)
  - [ ] Add provider-specific credentials
  - [ ] Set DATABASE_URL if using external PostgreSQL
  - [ ] Set REDIS_URL if using external Redis
  - [ ] Set JWT_SECRET to a random string
- [ ] Install dependencies: `npm install`

## Option A: Docker Setup (Recommended)

- [ ] Build images: `docker-compose build`
- [ ] Start services: `docker-compose up -d`
- [ ] Wait 30 seconds for database migrations
- [ ] Verify services:
  ```bash
  docker-compose ps
  # Should show: postgres, redis, backend, frontend running
  ```
- [ ] Check logs for errors: `docker-compose logs`
- [ ] Access frontend: http://localhost:5173
- [ ] Access backend: http://localhost:3001/health

## Option B: Manual Setup

### Backend

- [ ] Navigate to server: `cd server`
- [ ] Install dependencies: `npm install`
- [ ] Configure PostgreSQL connection in .env
- [ ] Configure Redis connection in .env
- [ ] Start backend: `npm run dev`
- [ ] Verify: `curl http://localhost:3001/health` → Should return `{"status":"OK"}`

### Frontend

- [ ] Open new terminal, navigate to client: `cd client`
- [ ] Install dependencies: `npm install`
- [ ] Update VITE_API_BASE_URL in .env if needed
- [ ] Start frontend: `npm run dev`
- [ ] Verify: http://localhost:5173 loads successfully

## Functionality Testing

### Dashboard Page

- [ ] Page loads without errors
- [ ] Stats cards display (Total Sent, Delivered, Failed, Pending)
- [ ] All numbers display as "0" initially

### Compose Page

- [ ] Message textarea present
- [ ] Character counter works (shows 0/160)
- [ ] Manual Entry mode allows entering phone numbers
- [ ] CSV upload mode accepts .csv and .txt files
- [ ] "Parse Numbers" button works for manual entry
- [ ] Recipient tags display properly
- [ ] Send button disabled when no recipients or message

### Groups Page

- [ ] "Create New Group" form visible
- [ ] Can create a group with name and description
- [ ] Created group appears in "Your Groups" list
- [ ] Can delete groups (with confirmation)

### Campaign History

- [ ] Page loads (may be empty initially)
- [ ] Campaign list displays when campaigns exist
- [ ] Can select a campaign to view details
- [ ] Campaign details show:
  - [ ] Campaign name
  - [ ] Message content
  - [ ] Total recipients
  - [ ] Status (draft, sending, completed, etc.)
  - [ ] Delivery breakdown (sent, delivered, failed)
  - [ ] Progress bar

### End-to-End Campaign Test

1. [ ] Compose a message with test phone number
2. [ ] Click "Send Campaign"
3. [ ] Verify success message
4. [ ] Check Campaign History page
5. [ ] Verify campaign appears in list
6. [ ] Check SMS provider logs for delivery

## Database Verification

```bash
# If using Docker PostgreSQL
docker-compose exec postgres psql -U postgres -d bulk_sms

# Inside psql, check tables:
\dt

# Should show: campaigns, contacts, groups, messages
```

## Redis Verification

```bash
# Check Redis connection
redis-cli ping

# Should return: PONG

# Check queue jobs
redis-cli llen rsmq:active:sms-queue
```

## Common Issues & Solutions

### Port Already in Use

- Frontend (5173): `lsof -i :5173` and kill process
- Backend (3001): `lsof -i :3001` and kill process
- PostgreSQL (5432): `lsof -i :5432` and kill process
- Redis (6379): `lsof -i :6379` and kill process

### Database Connection Failed

```bash
# Check PostgreSQL is running
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

### Redis Connection Failed

```bash
# Check Redis is running
docker-compose logs redis

# Verify with
redis-cli ping
```

### SMS Not Sending

- [ ] Check SMS_PROVIDER is correct in .env
- [ ] Verify provider credentials are accurate
- [ ] Check backend logs: `docker-compose logs backend`
- [ ] Verify queue is processing: Check Redis with redis-cli
- [ ] Check phone number format (should include country code)

### Frontend Not Loading

- [ ] Check vite server: `docker-compose logs frontend`
- [ ] Verify VITE_API_BASE_URL is correct
- [ ] Clear browser cache
- [ ] Check browser console for errors

## Production Checklist

- [ ] Update .env for production values
- [ ] Generate strong JWT_SECRET
- [ ] Set SMS_PROVIDER to production provider
- [ ] Configure production database URL
- [ ] Configure production Redis URL
- [ ] Enable HTTPS/SSL
- [ ] Set up proper logging
- [ ] Configure monitoring/alerting
- [ ] Set up database backups
- [ ] Configure rate limits appropriately
- [ ] Review security settings
- [ ] Load test before launch

## Performance Tuning

- [ ] Adjust QUEUE_CONCURRENCY based on SMS provider limits
- [ ] Monitor database connection pool
- [ ] Enable Redis persistence for durability
- [ ] Set up caching for frequently accessed data
- [ ] Monitor memory usage of queue workers

## Support & Troubleshooting

1. Check [README.md](./README.md) for detailed documentation
2. Review [IMPLEMENTATION.md](./IMPLEMENTATION.md) for architecture details
3. Check application logs: `docker-compose logs -f`
4. Verify environment variables: `grep -E "^[A-Z]" .env`
5. Test individual endpoints with curl or Postman

## Sign-Off

- [ ] All services running successfully
- [ ] All features tested and working
- [ ] No errors in logs
- [ ] Application ready for use/deployment
- [ ] Documentation reviewed

---

**Date Completed**: _______________
**Verified By**: _______________
**Notes**: _______________
