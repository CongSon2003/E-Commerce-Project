const userRouter = require('./user')
const initRouters = (app) => {
  app.use('/api/user', userRouter)
  return app.use('/', (req, res) => {
    res.send('Server Go On...')
  })
}

module.exports = initRouters