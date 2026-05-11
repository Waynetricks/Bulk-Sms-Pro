import express from 'express';
import cors from 'cors';
import './config/env';
import sequelize from './config/database';
import { apiLimiter, errorHandler, notFoundHandler } from './middleware/error';
import apiRoutes from './routes/api';
import { setupWebSocket } from './utils/websocket';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server running normally' });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    // Synchronize models with the database (creates tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('Database connected and synced successfully.');
    
    const { server } = setupWebSocket(app);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
