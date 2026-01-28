import { Hono } from 'hono';
import { z } from 'zod';
import { adminMiddleware, authMiddleware } from '../middleware/auth';
import { exerciseRepository } from '../repositories/exercise.repository';
import { Send } from '../utils/response';

type Variables = {
  userId: string;
  userRole: string;
};

const exerciseRoutes = new Hono<{ Variables: Variables }>();

const ExerciseSchema = z.object({
  title: z.string().min(1),
  url: z.string().optional().nullable(),
  overview: z.string().optional().nullable(),
  gifUrl: z.string().optional().nullable(),
  musclesWorkedImg: z.string().optional().nullable(),
});

// Get all exercises (Public or Auth, but usually auth is better)
exerciseRoutes.get('/', authMiddleware, async (c) => {
  const exercises = await exerciseRepository.findAll();
  return Send.ok(c, exercises);
});

// Get single exercise with content
exerciseRoutes.get('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const exercise = await exerciseRepository.getExerciseWithContent(id);
  if (!exercise) return Send.notFound(c, 'Exercise not found');
  return Send.ok(c, exercise);
});

// Create exercise (Admin only)
exerciseRoutes.post('/', authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json();
  const parsed = ExerciseSchema.safeParse(body);
  if (!parsed.success) return Send.error(c, parsed.error);

  const exercise = await exerciseRepository.create(parsed.data);
  return Send.created(c, exercise);
});

// Update exercise (Admin only)
exerciseRoutes.put('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const parsed = ExerciseSchema.partial().safeParse(body);
  if (!parsed.success) return Send.error(c, parsed.error);

  const exercise = await exerciseRepository.update(id, parsed.data);
  if (!exercise) return Send.notFound(c, 'Exercise not found');
  return Send.ok(c, exercise);
});

// Soft delete exercise (Admin only)
exerciseRoutes.delete('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const exercise = await exerciseRepository.delete(id);
  if (!exercise) return Send.notFound(c, 'Exercise not found');
  return Send.ok(c, { message: 'Exercise soft-deleted successfully' });
});

export { exerciseRoutes };
