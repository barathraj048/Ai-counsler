// backend/src/routes/dashboard.routes.ts
import { Router } from 'express';
import { getDashboard, toggleTodo, createTodo, deleteTodo, getTodos, discoverUniversities, shortlistUniversities, aiCounselor } from '../controllers/dashboard.controller.js';
const router = Router();
/**
 * Dashboard routes
 */
router.get('/', getDashboard);
/**
 * Todo routes
 */
router.get('/todos', getTodos);
router.post('/todos', createTodo);
router.patch('/todos/:id/toggle', toggleTodo);
router.delete('/todos/:id', deleteTodo);
/**
 * University discovery and shortlisting
 */
router.post('/discover-universities', discoverUniversities);
router.post('/shortlist-universities', shortlistUniversities);
/**
 * AI Counselor
 */
router.post('/counselor', aiCounselor);
export default router;
//# sourceMappingURL=dashboard.routes.js.map