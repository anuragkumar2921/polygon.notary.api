const {CustomError} = require('../exceptions/')

const errorHandlerMiddleware = (err, req, res, next) => {
  console.error(err);
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({success: false, message: err.message})
  }

  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(',')

    return res.status(400).json({success: false, message: msg})
  }

  return res.status(500).json({success: false, message: 'Something went wrong, please try again'})
}

module.exports = errorHandlerMiddleware