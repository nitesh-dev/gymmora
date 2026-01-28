import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { db } from '../db';
import { users } from '../db/schema';

const userRoutes = new OpenAPIHono();

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string(),
}).openapi('User');

const listUsersRoute = createRoute({
  method: 'get',
  path: '/',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(UserSchema),
        },
      },
      description: 'Retrieve all users',
    },
  },
});

const createUserRoute = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string(),
            email: z.string().email(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
      description: 'Create a new user',
    },
  },
});

userRoutes.openapi(listUsersRoute, async (c) => {
  const allUsers = await db.select().from(users);
  return c.json(allUsers.map(u => ({ ...u, createdAt: u.createdAt.toISOString() })));
});

userRoutes.openapi(createUserRoute, async (c) => {
  const body = c.req.valid('json');
  const newUser = await db.insert(users).values({
    name: body.name,
    email: body.email,
  }).returning();
  return c.json({ ...newUser[0], createdAt: newUser[0].createdAt.toISOString() }, 201);
});

export { userRoutes };
