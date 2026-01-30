// backend/src/routes/profile.routes.ts

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * Calculate profile strength based on user data
 */
function calculateProfileStrength(dashboardJson: any): number {
  let score = 10; // Base score for having a profile

  const profile = dashboardJson;

  // Academic Performance (15 points)
  if (profile?.gpa) {
    if (profile.gpa >= 3.5) score += 15;
    else if (profile.gpa >= 3.0) score += 10;
    else score += 5;
  }

  // Test Scores (20 points)
  if (profile?.testScores) {
    if (profile.testScores.gre || profile.testScores.gmat) score += 10;
    if (profile.testScores.toefl || profile.testScores.ielts) score += 10;
  }

  // Work Experience (15 points)
  if (profile?.workExperience && profile.workExperience.length > 0) {
    score += Math.min(15, profile.workExperience.length * 5);
  }

  // Statement of Purpose (12 points)
  if (profile?.sop) {
    score += 12;
  }

  // Letters of Recommendation (10 points)
  if (profile?.lors && profile.lors.length > 0) {
    score += Math.min(10, profile.lors.length * 3.5);
  }

  // Extracurricular Activities (8 points)
  if (profile?.extracurriculars && profile.extracurriculars.length > 0) {
    score += Math.min(8, profile.extracurriculars.length * 2.5);
  }

  // Publications/Research (10 points)
  if (profile?.publications && profile.publications.length > 0) {
    score += Math.min(10, profile.publications.length * 5);
  }

  return Math.min(100, Math.round(score));
}

/**
 * GET /api/profile/:userId/strength
 * Get the current profile strength
 */
router.get('/:userId/strength', async (req, res) => {
  try {
    const { userId } = req.params;

    const snapshot = await prisma.dashboardSnapshot.findUnique({
      where: { userId },
    });

    if (!snapshot) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      profileStrength: snapshot.profileStrength,
      dashboardJson: snapshot.dashboardJson,
    });
  } catch (error) {
    console.error('Error fetching profile strength:', error);
    res.status(500).json({ error: 'Failed to fetch profile strength' });
  }
});

/**
 * PUT /api/profile/:userId/update
 * Update profile data and recalculate strength
 */
router.put('/:userId/update', async (req, res) => {
  try {
    const { userId } = req.params;
    const { updates } = req.body;

    // Get existing snapshot
    let snapshot = await prisma.dashboardSnapshot.findUnique({
      where: { userId },
    });

    if (!snapshot) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Merge updates with existing data
    const updatedDashboardJson = {
      ...(snapshot.dashboardJson as object),
      ...updates,
    };

    // Recalculate profile strength
    const newStrength = calculateProfileStrength(updatedDashboardJson);

    // Update in database
    snapshot = await prisma.dashboardSnapshot.update({
      where: { userId },
      data: {
        dashboardJson: updatedDashboardJson,
        profileStrength: newStrength,
        version: { increment: 1 },
      },
    });

    res.json({
      success: true,
      profileStrength: snapshot.profileStrength,
      dashboardJson: snapshot.dashboardJson,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * POST /api/profile/:userId/complete-item
 * Mark a specific improvement item as complete
 */
router.post('/:userId/complete-item', async (req, res) => {
  try {
    const { userId } = req.params;
    const { itemId, itemData } = req.body;

    // Get existing snapshot
    let snapshot = await prisma.dashboardSnapshot.findUnique({
      where: { userId },
    });

    if (!snapshot) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const dashboardJson = snapshot.dashboardJson as any;
    let updates: any = {};

    // Apply updates based on item ID
    switch (itemId) {
      case 'improve-gpa':
        updates.gpa = itemData.gpa;
        break;

      case 'add-test-scores':
        updates.testScores = {
          ...(dashboardJson.testScores || {}),
          ...itemData,
        };
        break;

      case 'add-experience':
        updates.workExperience = [
          ...(dashboardJson.workExperience || []),
          itemData,
        ];
        break;

      case 'add-sop':
        updates.sop = itemData.sop;
        break;

      case 'add-lors':
        updates.lors = [...(dashboardJson.lors || []), itemData];
        break;

      case 'add-activities':
        updates.extracurriculars = [
          ...(dashboardJson.extracurriculars || []),
          itemData,
        ];
        break;

      default:
        return res.status(400).json({ error: 'Invalid item ID' });
    }

    // Merge updates
    const updatedDashboardJson = {
      ...dashboardJson,
      ...updates,
    };

    // Recalculate strength
    const newStrength = calculateProfileStrength(updatedDashboardJson);

    // Update database
    snapshot = await prisma.dashboardSnapshot.update({
      where: { userId },
      data: {
        dashboardJson: updatedDashboardJson,
        profileStrength: newStrength,
        version: { increment: 1 },
      },
    });

    res.json({
      success: true,
      profileStrength: snapshot.profileStrength,
      dashboardJson: snapshot.dashboardJson,
      itemId,
      message: 'Item completed and profile updated',
    });
  } catch (error) {
    console.error('Error completing item:', error);
    res.status(500).json({ error: 'Failed to complete item' });
  }
});

/**
 * POST /api/profile/:userId/recalculate
 * Manually trigger profile strength recalculation
 */
router.post('/:userId/recalculate', async (req, res) => {
  try {
    const { userId } = req.params;

    const snapshot = await prisma.dashboardSnapshot.findUnique({
      where: { userId },
    });

    if (!snapshot) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const newStrength = calculateProfileStrength(snapshot.dashboardJson);

    const updatedSnapshot = await prisma.dashboardSnapshot.update({
      where: { userId },
      data: {
        profileStrength: newStrength,
      },
    });

    res.json({
      success: true,
      profileStrength: updatedSnapshot.profileStrength,
      message: 'Profile strength recalculated',
    });
  } catch (error) {
    console.error('Error recalculating strength:', error);
    res.status(500).json({ error: 'Failed to recalculate strength' });
  }
});

export default router;