import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { userService } from '../services/user.service';
import { Send } from '../utils/response';

type Bindings = {};
type Variables = {
  userId: string;
  userRole: string;
};

const userRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

userRoutes.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId');
  const user = await userService.getUserById(userId);
  if (!user) return Send.notFound(c, 'User not found');
  return Send.ok(c, user);
});

userRoutes.get('/', authMiddleware, async (c) => {
  const role = c.get('userRole');
  if (role !== 'ADMIN') {
    return Send.forbidden(c);
  }
  const users = await userService.getAllUsers();
  return Send.ok(c, users);
});

export { userRoutes };
