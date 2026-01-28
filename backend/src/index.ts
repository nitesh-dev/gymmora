import { Hono } from 'hono'
import { env } from './config/env'
import { commonMiddleware } from './middleware/common'
import { exerciseRoutes } from './routes/exercise.routes'
import { userRoutes } from './routes/user.routes'

const app = new Hono()

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
app.route('/exercises', exerciseRoutes)

export default {
  port: parseInt(env.PORT),
  fetch: app.fetch,
}
