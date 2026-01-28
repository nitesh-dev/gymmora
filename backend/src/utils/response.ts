import { Context } from 'hono';
import { ContentfulStatusCode } from 'hono/utils/http-status';

export const Send = {
  ok: <T>(c: Context, data: T) => c.json(data, 200),
  created: <T>(c: Context, data: T) => c.json(data, 201),
  error: (c: Context, message: any, status: ContentfulStatusCode = 400) => 
    c.json({ error: message }, status),
  notFound: (c: Context, message = 'Resource not found') => 
    c.json({ error: message }, 404),
  unauthorized: (c: Context, message = 'Unauthorized') => 
    c.json({ error: message }, 401),
  forbidden: (c: Context, message = 'Forbidden') => 
    c.json({ error: message }, 403),
};
