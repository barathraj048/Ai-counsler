import { prisma } from '../lib/prisma.js';
export const storeOnboardingAnswer = async (req, res) => {
    try {
        const { userId, questionId, questionText, answer } = req.body;
        if (!userId || !questionId || !questionText || !answer) {
            return res.status(400).json({ error: 'Missing fields' });
        }
        await prisma.onboardingAnswer.create({
            data: {
                userId,
                questionId,
                questionText,
                answer: JSON.stringify(answer),
            },
        });
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Store onboarding error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
export const completeOnboarding = async (req, res) => {
    try {
        const { userId } = req.body;
        await prisma.user.upsert({
            where: { id: userId },
            update: { onboardingCompleted: true },
            create: {
                id: userId,
                onboardingCompleted: true,
            },
        });
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Complete onboarding error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
//# sourceMappingURL=onboarding.controller.js.map