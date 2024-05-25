const otpService = require('./otpService')
const mailService = require('./mailService')
const cacheService = require('./cacheService')
const s3Service = require('./s3Service')
const blockchainService = require('./blockchainService')

module.exports = {
  otpService,
  mailService,
  cacheService,
  s3Service,
  blockchainService
}