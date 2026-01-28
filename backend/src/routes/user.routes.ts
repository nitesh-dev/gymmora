import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { userService } from '../services/user.service';

const userRoutes = new Hono();

userRoutes.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId' as any);
  const user = await userService.getUserById(userId);
  return c.json(user);
});

userRoutes.get('/', authMiddleware, async (c) => {
  const role = c.get('userRole' as any);
  if (role !== 'ADMIN') {
    return c.json({ error: 'Forbidden' }, 403);
  }
  const users = await userService.getAllUsers();
  return c.json(users);
});

export { userRoutes };
