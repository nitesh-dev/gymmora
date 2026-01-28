import { Hono } from 'hono';
import { logger } from 'hono/logger';

export const commonMiddleware = (app: Hono) => {
  app.use('*', logger());
  app.onError((err, c) => {
    console.error(`${err}`);
    return c.json({ error: 'Internal Server Error' }, 500);
  });
};
