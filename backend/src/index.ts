import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { env } from './config/env'
import { commonMiddleware } from './middleware/common'
import { userRoutes } from './routes/user.routes'

const app = new OpenAPIHono()

// Basic setup
commonMiddleware(app as any)

app.get('/', (c) => {
  return c.json({
    message: 'Gymmora Backend API',
    status: 'online',
  })
})

// Routes
app.route('/users', userRoutes)

// Swagger Documentation
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Gymmora API',
  },
})

app.get('/ui', swaggerUI({ url: '/doc' }))

export default {
  port: parseInt(env.PORT),
  fetch: app.fetch,
}
