import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { planService } from '../services/plan.service';

const router = new Hono();

router.use('*', authMiddleware);

router.get('/', async (c) => {
    const plans = await planService.getAllPlans();
    return c.json(plans);
});

router.get('/:id', async (c) => {
    const id = c.req.param('id');
    const plan = await planService.getPlanDetails(id);
    if (!plan) return c.json({ error: 'Plan not found' }, 404);
    return c.json(plan);
});

router.post('/', async (c) => {
    const body = await c.req.json();
    const plan = await planService.createPlan(body);
    return c.json(plan, 201);
});

router.put('/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json();
    const plan = await planService.updatePlan(id, body);
    return c.json(plan);
});

router.delete('/:id', async (c) => {
    const id = c.req.param('id');
    await planService.deletePlan(id);
    return c.json({ success: true });
});

export default router;
