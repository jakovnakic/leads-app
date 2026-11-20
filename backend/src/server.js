import express from 'express';
import pool from './db/pool.js';
import scoringConfigRoutes from './routes/scoringConfigRoutes.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import agentRoutes from './routes/agentRoutes.js';
import leadRoutes from './routes/leadRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// General middleware
app.use(express.json());

// API routes
app.use('/api/scoring-config', scoringConfigRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/leads', leadRoutes);

// Health endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS current_time');

    res.status(200).json({
      status: 'OK',
      database: 'Connected',
      timestamp: result.rows[0].current_time,
    });
  } catch (error) {
    console.error('Database connection failed:', error);

    res.status(500).json({
      status: 'Error',
      database: 'Disconnected',
    });
  }
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
