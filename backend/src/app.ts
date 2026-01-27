import express from 'express';
import cors from 'cors';
import onboardingRoutes from './routes/onboarding.routes';

const app = express();

app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true,
}));

app.use(express.json());

app.use('/storeOnboardingData', onboardingRoutes);

export default app;
