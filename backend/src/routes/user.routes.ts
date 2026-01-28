import { Hono } from 'hono';
import { z } from 'zod';
import { userService } from '../services/user.service';

const userRoutes = new Hono();

const CreateUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

userRoutes.get('/', async (c) => {
  const users = await userService.getAllUsers();
  return c.json(users);
});

userRoutes.post('/', async (c) => {
  const json = await c.req.json();
  const body = CreateUserSchema.parse(json);
  const newUser = await userService.createUser(body);
  return c.json(newUser, 201);
});

export { userRoutes };
