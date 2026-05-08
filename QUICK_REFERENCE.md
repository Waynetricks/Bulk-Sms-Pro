# Bulk SMS Application - Quick Reference Card

## 🚀 Quick Start Commands

```bash
# SETUP
cp .env.example .env          # Create env file
npm install                   # Install dependencies

# START WITH DOCKER (Recommended)
docker-compose up -d          # Start all services
docker-compose ps             # Check status
docker-compose logs -f        # View logs

# START MANUALLY
cd server && npm run dev      # Terminal 1 - Backend
cd client && npm run dev      # Terminal 2 - Frontend

# BUILD FOR PRODUCTION
docker-compose build          # Build images
npm run build                 # Compile frontend & backend
```

---

## 🌐 Access Points

| Service | URL | Notes |
|---------|-----|-------|
| Frontend | http://localhost:5173 | React Vite app |
| Backend API | http://localhost:3001/api | Express server |
| Health Check | http://localhost:3001/health | API status |
| WebSocket | ws://localhost:3001 | Real-time updates |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache & queue |

---

## 📋 Core API Endpoints

```bash
# Campaigns
POST   /api/campaigns           # Create campaign
GET    /api/campaigns           # List campaigns
GET    /api/campaigns/:id       # Get status
POST   /api/campaigns/:id/send  # Send campaign

# Contacts
POST   /api/contacts            # Add contacts
GET    /api/contacts            # List contacts
DELETE /api/contacts/:id        # Delete contact

# Groups
POST   /api/groups              # Create group
GET    /api/groups              # List groups
GET    /api/groups/:id          # Get group
PUT    /api/groups/:id          # Update group
DELETE /api/groups/:id          # Delete group

# Webhooks
POST   /api/webhooks/delivery-report  # Delivery updates
```

---

## 📁 Important Files

| Path | Purpose |
|------|---------|
| `.env` | Configuration (create from .env.example) |
| `server/src/index.ts` | Backend entry point |
| `client/src/App.tsx` | Frontend entry point |
| `docker-compose.yml` | Development services |
| `README.md` | Full documentation |

---

## 🔧 Configuration

### Required Environment Variables

```env
SMS_PROVIDER=twilio                    # Choose provider
DATABASE_URL=postgresql://...          # Database
REDIS_URL=redis://localhost:6379       # Cache
JWT_SECRET=your_secret_key             # Security

# SMS Provider Specific (at least one set)
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
AFRICAS_TALKING_API_KEY=xxx
VONAGE_API_KEY=xxx
```

---

## 🛠️ Common Tasks

### Check Service Status
```bash
docker-compose ps
docker-compose logs [service_name]
```

### Reset Database
```bash
docker-compose down -v          # Remove volumes
docker-compose up -d            # Restart fresh
```

### Connect to Database
```bash
docker-compose exec postgres psql -U postgres -d bulk_sms
```

### Monitor Redis
```bash
docker-compose exec redis redis-cli
redis-cli PING                  # Test connection
redis-cli MONITOR               # Watch commands
```

### View Application Logs
```bash
docker-compose logs -f backend   # Backend logs
docker-compose logs -f frontend  # Frontend logs
docker-compose logs -f postgres  # Database logs
```

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Kill process: `lsof -i :[port]` then `kill -9 [PID]` |
| Database won't connect | Wait 30s for PostgreSQL to start, check logs |
| Queue not processing | Verify Redis is running: `redis-cli PING` |
| Frontend not loading | Check VITE_API_BASE_URL in .env |
| SMS not sending | Verify SMS_PROVIDER credentials in .env |
| CORS errors | Ensure backend CORS middleware is configured |

---

## 📚 Documentation

| File | Contains |
|------|----------|
| README.md | Complete documentation |
| QUICKSTART.md | Setup guide |
| PROJECT_OVERVIEW.md | Project summary |
| SETUP_CHECKLIST.md | Installation checklist |
| TROUBLESHOOTING.md | Issue resolution |
| IMPLEMENTATION.md | Architecture details |

---

## 🎯 Features at a Glance

✅ Compose messages
✅ Send bulk SMS
✅ Upload CSV contacts
✅ Create contact groups
✅ View campaign history
✅ Real-time delivery status
✅ Multiple SMS providers
✅ Queue-based processing
✅ Rate limiting
✅ WebSocket real-time updates
✅ Docker containerization
✅ TypeScript type safety

---

## 📊 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Tailwind |
| Backend | Express.js + Node.js + TypeScript |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Queue | Bull 4 |
| Real-time | WebSockets |
| Container | Docker + Docker Compose |

---

## 🔐 Security Notes

✅ Rate limiting enabled
✅ CORS configured
✅ Environment variables for secrets
✅ SQL injection prevention via ORM
✅ Input validation on endpoints
✅ JWT token support ready

---

## 📈 Performance Tips

1. Adjust `QUEUE_CONCURRENCY` based on SMS provider limits
2. Use database indexes (already configured)
3. Enable Redis persistence for durability
4. Monitor queue job backlog
5. Scale horizontally with multiple backend instances

---

## 🔄 Development Workflow

```bash
# Make changes
# Edit files in server/src/ or client/src/

# Restart (if using manual setup)
# Services auto-reload with npm run dev

# Build for production
npm run build
docker-compose build
docker-compose up -d
```

---

## 📞 SMS Provider Credentials Location

- **Twilio**: Dashboard → Account SID, Auth Token, Phone Number
- **Africa's Talking**: Dashboard → API Key, Username
- **Vonage**: Developer Portal → API Key, API Secret

---

## 🎯 Next Steps

1. ✅ Copy `.env.example` to `.env`
2. ✅ Add SMS provider credentials
3. ✅ Run `docker-compose up -d`
4. ✅ Access http://localhost:5173
5. ✅ Send a test campaign

---

## 💾 Backup & Restore

```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres bulk_sms > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres bulk_sms < backup.sql

# Backup Redis
docker-compose exec redis redis-cli BGSAVE
```

---

## 🚀 Deployment

```bash
# Using docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml up -d

# Or deploy to cloud platform:
# - Heroku, Railway, Render (Docker support)
# - AWS, Azure, GCP (container services)
# - Kubernetes (for enterprise scale)
```

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Production Ready ✅
