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
  
  // If it's a full create (from studio)
  if (body.exercise) {
      const results = await exerciseRepository.batchCreate([{
          exercise: body.exercise,
          content: body.content || [],
          musclesWorked: body.musclesWorked || [],
          muscleGroups: body.muscleGroups || [],
          equipment: body.equipment || [],
      }]);
      return Send.created(c, results[0]);
  }

  const parsed = ExerciseSchema.safeParse(body);
  if (!parsed.success) return Send.error(c, parsed.error);

  const exercise = await exerciseRepository.create(parsed.data);
  return Send.created(c, exercise);
});

exerciseRoutes.post('/import', authMiddleware, adminMiddleware, async (c) => {
    const data = await c.req.json();
    if (!Array.isArray(data)) {
        return Send.error(c, 'Data must be an array', 400);
    }

    try {
        const mappedData = data.map((item: any) => {
            const exercise = {
                title: item.title,
                url: item.url,
                overview: item.overview,
                gifUrl: item.gifUrl,
                musclesWorkedImg: item.musclesWorked?.img,
            };

            const content: any[] = [];
            if (item.howToPerform) {
                item.howToPerform.forEach((text: string, index: number) => {
                    content.push({ contentType: 'step', contentText: text, orderIndex: index });
                });
            }
            if (item.benefits) {
                item.benefits.forEach((text: string, index: number) => {
                    content.push({ contentType: 'benefit', contentText: text, orderIndex: index });
                });
            }
            if (item.tips) {
                item.tips.forEach((text: string, index: number) => {
                    content.push({ contentType: 'tip', contentText: text, orderIndex: index });
                });
            }
            if (item.commonMistakes) {
                item.commonMistakes.forEach((text: string, index: number) => {
                    content.push({ contentType: 'mistake', contentText: text, orderIndex: index });
                });
            }

            const musclesWorked = item.musclesWorked?.items?.map((m: any) => ({
                name: m.name,
                percentage: parseInt(m.percentage) || 100
            })) || [];

            const muscleGroups = item.muscleGroups?.map((g: string) => ({
                name: g
            })) || [];

            const equipment = item.equipment?.map((e: string) => ({
                name: e
            })) || [];

            return { exercise, content, musclesWorked, muscleGroups, equipment };
        });

        const results = await exerciseRepository.batchCreate(mappedData);
        return Send.ok(c, { count: results.length });
    } catch (error: any) {
        return Send.error(c, error.message || 'Import failed');
    }
});

// Update exercise (Admin only)
exerciseRoutes.put('/:id', authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  
  // If it's a "full" update (from studio)
  if (body.exercise || body.content) {
      const exercise = await exerciseRepository.updateFullExercise(id, body);
      if (!exercise) return Send.notFound(c, 'Exercise not found');
      return Send.ok(c, exercise);
  }

  // Simple basic info update
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
