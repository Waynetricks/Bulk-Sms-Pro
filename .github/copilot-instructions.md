<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Bulk SMS Application Development

This is a full-stack bulk SMS web application built with React (frontend), Node.js/Express (backend), PostgreSQL (database), and Redis (queue).

### Project Structure

- `/client` - React + Tailwind CSS frontend with Vite
- `/server` - Node.js + Express TypeScript backend
- Docker Compose for local development with PostgreSQL and Redis
- Monorepo with shared package management

### Key Technologies

- **Frontend**: React 18, TypeScript, Tailwind CSS, Zustand (state), Vite
- **Backend**: Node.js, Express, TypeScript, Sequelize ORM, Bull (queues)
- **Database**: PostgreSQL with Sequelize models
- **Queue**: Bull with Redis for bulk SMS sending
- **SMS Providers**: Twilio, Africa's Talking, Vonage support
- **Real-time**: WebSocket support for delivery updates

### Running the Application

1. **With Docker Compose** (Recommended):
   ```bash
   cp .env.example .env
   # Edit .env with your SMS provider credentials
   docker-compose up -d
   ```

2. **Manual Setup**:
   ```bash
   # Backend
   cd server
   npm install
   npm run dev
   
   # Frontend (in new terminal)
   cd client
   npm install
   npm run dev
   ```

### API Endpoints

- `POST /api/campaigns` - Create campaign
- `POST /api/campaigns/:id/send` - Send campaign
- `GET /api/campaigns` - List campaigns
- `GET /api/campaigns/:id` - Get campaign status
- `POST /api/contacts` - Add contacts
- `GET /api/contacts` - List contacts
- `POST /api/groups` - Create group
- `GET /api/groups` - List groups
- `POST /api/webhooks/delivery-report` - Delivery webhooks

### Environment Setup

See `.env.example` for all required variables. Key ones:
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `SMS_PROVIDER` - Choose: twilio, africas_talking, or vonage
- SMS provider credentials for chosen provider

### Development Notes

- TypeScript is used throughout for type safety
- All API responses follow standard JSON format
- Rate limiting is applied to send endpoints
- Bulk operations use batch processing for performance
- Queue system handles SMS delivery with retry logic
