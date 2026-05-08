import express from 'express';
import cors from 'cors';
import './config/env';
// import sequelize from './config/database';
import { apiLimiter, errorHandler, notFoundHandler } from './middleware/error';
import apiRoutes from './routes/api';
import { setupWebSocket } from './utils/websocket';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server running without database' });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server without database for demo
const startServer = async () => {
  try {
    console.log('Starting server without database (demo mode)');
    
    const { server } = setupWebSocket(app);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Note: Database not connected - demo mode only');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
