// backend/src/app.ts

import express from 'express';
import cors from 'cors';
import onboardingRoutes from './routes/onboarding.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/onboarding', onboardingRoutes);

// Health check (optional - you can add this)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;