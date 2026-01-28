import type { Request ,Response} from 'express';
import { prisma } from '../lib/prisma.js';

export const storeOnboardingAnswer = async (req: Request, res: Response) => {
  try {
    const { userId, questionId, questionText, answer } = req.body;

    if (!userId || !questionId || !questionText) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // ✅ ENSURE USER EXISTS
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId },
    });

    // ✅ NOW SAFE TO INSERT ANSWER
    await prisma.onboardingAnswer.create({
      data: {
        userId,
        questionId,
        questionText,
        answer: JSON.stringify(answer),
      },
    });
    console.log('Stored onboarding answer for user:', userId);
    return res.json({ success: true });
  } catch (error) {
    console.error('Store onboarding error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
