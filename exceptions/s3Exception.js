const {StatusCodes} = require('http-status-codes');
const CustomError = require("./customError");

class S3Exception extends CustomError {
  constructor(message) {
    super(message)
    this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
  }
}

module.exports = S3Exception