import type { Request, Response } from 'express';
/**
 * Get or generate dashboard
 * GET /api/dashboard?userId=xxx
 */
export declare function getDashboard(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * Discover universities based on user profile
 * POST /api/dashboard/discover-universities
 */
export declare function discoverUniversities(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * Shortlist universities based on user priorities
 * POST /api/dashboard/shortlist-universities
 */
export declare function shortlistUniversities(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * AI Counselor with emotional distress detection
 * POST /api/dashboard/counselor
 */
export declare function aiCounselor(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * Toggle todo completion status
 * PATCH /api/dashboard/todos/:id/toggle
 */
export declare function toggleTodo(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Create a new todo
 * POST /api/dashboard/todos
 */
export declare function createTodo(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Delete a todo
 * DELETE /api/dashboard/todos/:id
 */
export declare function deleteTodo(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get all todos for a user
 * GET /api/dashboard/todos?userId=xxx
 */
export declare function getTodos(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=dashboard.controller.d.ts.map