import { Context, Next } from 'hono';
import { supabase } from '../config/supabase';
import { userRepository } from '../repositories/user.repository';
import { Send } from '../utils/response';

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return Send.unauthorized(c, 'Missing or invalid token');
  }

  const token = authHeader.split(' ')[1];

  try {
    // Use Supabase Auth to verify the token - most robust way
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

    if (error || !authUser) {
      console.error('Supabase Auth verification failed:', error?.message);
      throw new Error('Unauthorized');
    }

    // Now check our local DB for role/profile
    const userProfile = await userRepository.findById(authUser.id);
    
    c.set('userId', authUser.id);
    c.set('userRole', userProfile?.role || 'USER');
    
    await next();
  } catch (e: any) {
    return Send.unauthorized(c);
  }
};

export const adminMiddleware = async (c: Context, next: Next) => {
  const role = c.get('userRole');
  if (role !== 'ADMIN') {
    return Send.forbidden(c, 'Admin access only');
  }
  await next();
};
