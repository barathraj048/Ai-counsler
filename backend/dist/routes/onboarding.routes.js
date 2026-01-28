import { Router } from 'express';
import { storeOnboardingAnswer, } from '../controllers/onboarding.controller.js';
const router = Router();
router.post('/answer', storeOnboardingAnswer);
export default router;
//# sourceMappingURL=onboarding.routes.js.map