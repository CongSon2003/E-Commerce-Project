const userRouter = require('./user')
const productRouter = require('./product')
const { globalErrorHandler, errNotFound } = require('../middlewares/errorHandling')
const initRouters = (app) => {
  app.use('/api/user', userRouter)
  app.use('/api/product', productRouter)
  // Use the errNotFound middleware
  app.use(errNotFound);
  app.use(globalErrorHandler);
  return app.use('/', (req, res) => {
    res.send('Server Go On...')
  })
}

module.exports = initRouters;