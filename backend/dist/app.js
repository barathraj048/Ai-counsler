import express from 'express';
import cors from 'cors';
import onboardingRoutes from './routes/onboarding.routes.js';
const app = express();
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true,
}));
app.use(express.json());
app.use('/storeOnboardingData', onboardingRoutes);
export default app;
//# sourceMappingURL=app.js.map