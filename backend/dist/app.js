import express from 'express';
import cors from 'cors';
import onboardingRoutes from './routes/onboarding.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/onboarding', onboardingRoutes);
export default app;
//# sourceMappingURL=app.js.map