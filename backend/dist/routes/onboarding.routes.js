import { Router } from 'express';
import { storeOnboardingAnswer, completeOnboarding, } from '../controllers/onboarding.controller.js';
const router = Router();
router.post('/', storeOnboardingAnswer);
router.post('/complete', completeOnboarding);
export default router;
//# sourceMappingURL=onboarding.routes.js.map