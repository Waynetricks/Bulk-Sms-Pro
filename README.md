# Bulk SMS Web Application

A full-stack bulk SMS application built with React, Node.js, Express, and PostgreSQL with real-time delivery status updates.

## Features

- **Dashboard**: View SMS statistics (sent, delivered, failed, pending)
- **Compose**: Create and send bulk SMS campaigns with file upload or manual entry
- **Campaign History**: Track all sent campaigns with detailed status reports
- **Contact Groups**: Organize contacts into reusable groups
- **Real-time Updates**: WebSocket support for live delivery status
- **Queue System**: Bull + Redis for reliable bulk sending without timeouts
- **SMS Providers**: Support for Twilio, Africa's Talking, and Vonage
- **Rate Limiting**: Built-in protection against API rate limits
- **Webhook Support**: Receive delivery reports from SMS providers

## Project Structure

```
.
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── store/        # Zustand state management
│   │   └── hooks/        # Custom React hooks
│   ├── package.json
│   └── tailwind.config.js
├── server/               # Node.js/Express backend
│   ├── src/
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── gateway/      # SMS provider implementations
│   │   ├── queue/        # Job queue setup
│   │   ├── middleware/   # Express middleware
│   │   └── config/       # Configuration files
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml    # Docker environment setup
├── .env.example          # Environment variables template
└── README.md            # This file
```

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 15+
- Redis 7+
- SMS provider account (Twilio, Africa's Talking, or Vonage)

## Quick Start

### 1. Clone and Setup

```bash
# Navigate to project directory
cd bulk-sms

# Copy environment file
cp .env.example .env

# Edit .env with your SMS provider credentials
```

### 2. Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# Frontend: http://localhost:5173
# Backend: http://localhost:3001
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

### 3. Manual Setup

```bash
# Install backend dependencies
cd server
npm install
npm run build

# In another terminal, install frontend dependencies
cd ../client
npm install

# Start backend (from server directory)
npm run dev

# Start frontend (from client directory)
npm run dev
```

## Environment Variables

Key variables to configure:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bulk_sms

# Redis
REDIS_URL=redis://localhost:6379

# SMS Provider (choose one)
SMS_PROVIDER=twilio  # or africas_talking, vonage

# Twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Africa's Talking
AFRICAS_TALKING_API_KEY=your_key
AFRICAS_TALKING_USERNAME=your_username

# Vonage
VONAGE_API_KEY=your_key
VONAGE_API_SECRET=your_secret
VONAGE_FROM_NUMBER=YourBrand

# Queue
QUEUE_CONCURRENCY=10
QUEUE_RATE_LIMIT=100
```

## API Endpoints

### Campaigns

- `POST /api/campaigns` - Create a new campaign
- `GET /api/campaigns` - List all campaigns
- `GET /api/campaigns/:id` - Get campaign details
- `POST /api/campaigns/:id/send` - Send a campaign

### Contacts

- `POST /api/contacts` - Add contacts
- `GET /api/contacts` - List contacts
- `DELETE /api/contacts/:id` - Delete a contact

### Groups

- `POST /api/groups` - Create a group
- `GET /api/groups` - List all groups
- `GET /api/groups/:id` - Get group with contacts
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

### Webhooks

- `POST /api/webhooks/delivery-report` - Receive delivery status updates

## Database Schema

### Tables

- **contacts**: Store phone numbers and contact information
- **groups**: Organize contacts into groups
- **campaigns**: Store campaign metadata
- **messages**: Individual message records with delivery status

## Frontend Pages

1. **Dashboard**: Overview with key statistics
2. **Compose**: Create and send new campaigns
3. **Campaign History**: View all sent campaigns with status
4. **Contact Groups**: Manage contact groups

## Deployment

### Docker Production Build

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Environment-specific Configuration

Update `.env` for your deployment environment (production, staging, etc.)

## SMS Provider Setup

### Twilio

1. Create account at twilio.com
2. Get Account SID and Auth Token
3. Purchase or verify a phone number
4. Set environment variables

### Africa's Talking

1. Register at africastalking.com
2. Get API key and username
3. Set environment variables

### Vonage

1. Create account at vonage.com
2. Get API key and secret
3. Set environment variables

## Development

### Frontend Development

```bash
cd client
npm run dev      # Start dev server on http://localhost:5173
npm run build    # Production build
npm run typecheck # TypeScript type checking
```

### Backend Development

```bash
cd server
npm run dev      # Start with hot reload
npm run build    # Production build
npm run typecheck # TypeScript type checking
```

## Testing

```bash
# Backend tests (to be implemented)
cd server
npm test

# Frontend tests (to be implemented)
cd client
npm test
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

### Redis Connection Issues

```bash
# Check Redis is running
docker-compose logs redis

# Verify connection
redis-cli ping  # Should return PONG
```

### Queue Processing Issues

- Check QUEUE_CONCURRENCY setting
- Verify SMS provider credentials
- Check Redis connection
- Review application logs

## Performance Optimization

- Use connection pooling for database
- Enable Redis caching for frequently accessed data
- Adjust QUEUE_CONCURRENCY based on SMS provider limits
- Use bulk operations for large contact imports

## Security Best Practices

- Store sensitive credentials in environment variables
- Use HTTPS in production
- Validate and sanitize all inputs
- Implement rate limiting
- Use strong JWT secrets
- Regularly update dependencies

## License

MIT

## Support

For issues and feature requests, please open an issue in the repository.
