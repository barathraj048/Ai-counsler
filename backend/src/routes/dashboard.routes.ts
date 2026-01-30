// backend/src/routes/dashboard.routes.ts

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  getDashboard,
  toggleTodo,
  createTodo,
  deleteTodo,
  getTodos,
  aiCounselor,
} from '../controllers/dashboard.controller.js';

const router = Router();
const prisma = new PrismaClient();

/* ======================================================
   DASHBOARD (OLD – CONTROLLER BASED)
====================================================== */
router.get('/', getDashboard);

/* ======================================================
   TODOs (OLD – CONTROLLER BASED)
   ⚠️ Do NOT remove – existing frontend depends on this
====================================================== */
router.get('/todos', getTodos);
router.post('/todos', createTodo);
router.patch('/todos/:id/toggle', toggleTodo);
router.delete('/todos/:id', deleteTodo);

/* ======================================================
   TODOs (NEW – PRISMA BASED, USER SCOPED)
====================================================== */

/**
 * GET /api/dashboard/todos/:userId
 * Fetch all todos for a user
 */
router.get('/todos/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const todos = await prisma.dashboardTodo.findMany({
      where: { userId },
      orderBy: [
        { completed: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    res.json({ todos });
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

/**
 * POST /api/dashboard/todos
 * Create a new todo
 */
router.post('/todos', async (req, res) => {
  try {
    const { userId, title, priority = 'medium' } = req.body;

    if (!userId || !title) {
      return res.status(400).json({ error: 'userId and title are required' });
    }

    const todo = await prisma.dashboardTodo.create({
      data: {
        userId,
        title,
        priority,
        completed: false,
      },
    });

    res.status(201).json({ todo });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

/**
 * PATCH /api/dashboard/todos/:id/toggle
 */
router.patch('/todos/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const existingTodo = await prisma.dashboardTodo.findFirst({
      where: { id, userId },
    });

    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const updatedTodo = await prisma.dashboardTodo.update({
      where: { id },
      data: { completed: !existingTodo.completed },
    });

    res.json({ todo: updatedTodo });
  } catch (error) {
    console.error('Error toggling todo:', error);
    res.status(500).json({ error: 'Failed to toggle todo' });
  }
});

/**
 * DELETE /api/dashboard/todos/:id
 */
router.delete('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const existingTodo = await prisma.dashboardTodo.findFirst({
      where: { id, userId: userId as string },
    });

    if (!existingTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    await prisma.dashboardTodo.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

/**
 * POST /api/dashboard/todos/bulk
 * AI-generated tasks (bulk create)
 */
router.post('/todos/bulk', async (req, res) => {
  try {
    const { userId, todos } = req.body;

    if (!userId || !Array.isArray(todos)) {
      return res.status(400).json({ error: 'userId and todos array required' });
    }

    await prisma.dashboardTodo.createMany({
      data: todos.map((todo: any) => ({
        userId,
        title: todo.title,
        priority: todo.priority || 'medium',
        completed: false,
      })),
    });

    const createdTodos = await prisma.dashboardTodo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: todos.length,
    });

    res.status(201).json({ todos: createdTodos });
  } catch (error) {
    console.error('Error creating bulk todos:', error);
    res.status(500).json({ error: 'Failed to create todos' });
  }
});

/* ======================================================
   UNIVERSITY DISCOVERY & SHORTLIST
====================================================== */

/**
 * GET /api/dashboard/universities/:userId
 * Get all universities for a user
 */
router.get('/universities/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const universities = await prisma.university.findMany({
      where,
      orderBy: { discoveredAt: 'desc' },
    });

    res.json({ universities });
  } catch (error) {
    console.error('Error fetching universities:', error);
    res.status(500).json({ error: 'Failed to fetch universities' });
  }
});

/**
 * POST /api/dashboard/universities/discover
 * Save discovered universities to database
 */
router.post('/universities/discover', async (req, res) => {
  try {
    const { userId, universities } = req.body;

    if (!userId || !Array.isArray(universities)) {
      return res.status(400).json({ error: 'userId and universities array required' });
    }

    // Create universities in database
    const created = await Promise.all(
      universities.map(async (uni: any) => {
        // Check if university already exists for this user
        const existing = await prisma.university.findFirst({
          where: {
            userId,
            name: uni.name,
          },
        });

        if (existing) {
          return existing;
        }

        return prisma.university.create({
          data: {
            userId,
            name: uni.name,
            location: uni.location || null,
            ranking: uni.ranking || null,
            programName: uni.program || null,
            tuitionFee: uni.tuition || null,
            universityData: uni,
            status: 'discovered',
          },
        });
      })
    );

    res.status(201).json({ 
      success: true,
      universities: created,
      count: created.length 
    });
  } catch (error) {
    console.error('Error saving discovered universities:', error);
    res.status(500).json({ error: 'Failed to save universities' });
  }
});

/**
 * POST /api/dashboard/universities/:universityId/shortlist
 * Move university to shortlist
 */
router.post('/universities/:universityId/shortlist', async (req, res) => {
  try {
    const { universityId } = req.params;
    const { userId } = req.body;

    const university = await prisma.university.findFirst({
      where: { id: universityId, userId },
    });

    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }

    const updated = await prisma.university.update({
      where: { id: universityId },
      data: {
        status: 'shortlisted',
        shortlistedAt: new Date(),
      },
    });

    res.json({ 
      success: true,
      university: updated 
    });
  } catch (error) {
    console.error('Error shortlisting university:', error);
    res.status(500).json({ error: 'Failed to shortlist university' });
  }
});

/**
 * DELETE /api/dashboard/universities/:universityId/shortlist
 * Remove university from shortlist (back to discovered)
 */
router.delete('/universities/:universityId/shortlist', async (req, res) => {
  try {
    const { universityId } = req.params;
    const { userId } = req.query;

    const university = await prisma.university.findFirst({
      where: { id: universityId, userId: userId as string },
    });

    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }

    const updated = await prisma.university.update({
      where: { id: universityId },
      data: {
        status: 'discovered',
        shortlistedAt: null,
      },
    });

    res.json({ 
      success: true,
      university: updated 
    });
  } catch (error) {
    console.error('Error removing from shortlist:', error);
    res.status(500).json({ error: 'Failed to remove from shortlist' });
  }
});

/**
 * DELETE /api/dashboard/universities/:universityId
 * Delete a university
 */
router.delete('/universities/:universityId', async (req, res) => {
  try {
    const { universityId } = req.params;
    const { userId } = req.query;

    const university = await prisma.university.findFirst({
      where: { id: universityId, userId: userId as string },
    });

    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }

    await prisma.university.delete({
      where: { id: universityId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting university:', error);
    res.status(500).json({ error: 'Failed to delete university' });
  }
});

/**
 * PUT /api/dashboard/universities/:universityId
 * Update university notes or other fields
 */
router.put('/universities/:universityId', async (req, res) => {
  try {
    const { universityId } = req.params;
    const { userId, notes } = req.body;

    const university = await prisma.university.findFirst({
      where: { id: universityId, userId },
    });

    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }

    const updated = await prisma.university.update({
      where: { id: universityId },
      data: {
        notes: notes !== undefined ? notes : university.notes,
      },
    });

    res.json({ 
      success: true,
      university: updated 
    });
  } catch (error) {
    console.error('Error updating university:', error);
    res.status(500).json({ error: 'Failed to update university' });
  }
});

/* ======================================================
   AI COUNSELOR
====================================================== */
router.post('/counselor', aiCounselor);

export default router;