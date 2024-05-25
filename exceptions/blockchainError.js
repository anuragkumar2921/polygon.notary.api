const {StatusCodes} = require('http-status-codes');
const CustomError = require("./customError");

class BlockchainError extends CustomError {
  constructor(message) {
    super(message)
    this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
  }
}

module.exports = BlockchainError