import express from 'express';
import cors from 'cors';

import scoringConfigRoutes from './routes/scoringConfigRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
  }),
);

app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/scoring-config', scoringConfigRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/leads', leadRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
