import { Router } from 'express';
import {
  storeOnboardingAnswer,
  completeOnboarding,
} from '../controllers/onboarding.controller';

const router = Router();

router.post('/', storeOnboardingAnswer);
router.post('/complete', completeOnboarding);

export default router;
