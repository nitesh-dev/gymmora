import { Context, Next } from 'hono';
import { jwt } from 'hono/jwt';
import { env } from '../config/env';
import { userRepository } from '../repositories/user.repository';

export const authMiddleware = async (c: Context, next: Next) => {
  const jwtMiddleware = jwt({
    secret: env.SUPABASE_JWT_SECRET,
    alg: 'HS256',
  });

  try {
    await jwtMiddleware(c, async () => {
      const payload = c.get('jwtPayload');
      if (!payload || !payload.sub) {
        throw new Error('Unauthorized');
      }

      // Context is key for performance - fetch user from our users table
      // which was created by the Supabase DB trigger.
      const user = await userRepository.findById(payload.sub);
      
      c.set('userId', payload.sub);
      c.set('userRole', user?.role || 'USER');
    });
    
    await next();
  } catch (e) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
};

export const adminMiddleware = async (c: Context, next: Next) => {
  const role = c.get('userRole');
  if (role !== 'ADMIN') {
    return c.json({ error: 'Forbidden: Admin access only' }, 403);
  }
  await next();
};
