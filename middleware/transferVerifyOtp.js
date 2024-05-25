const {otpService} = require("../services/");
const errors = require("../exceptions/");

const transferVerifyOtp = async (req, res, next) => {
  const {email, otp, toEmail, toOtp} = req.body
  if (!email || !otp) {
    throw new errors.BadRequestError('Please provide email and otp');
  }
  if (!toEmail || !toOtp) {
    throw new errors.BadRequestError('Please provide toEmail and toOtp');
  }
  const isVerifiedFrom = await otpService.verifyOtp(email, otp)
  const isVerifiedTo = await otpService.verifyOtp(toEmail, toOtp)
  if (!isVerifiedFrom || !isVerifiedTo) {
    throw new errors.ForbiddenError('OTP Verification failed !!')
  }
  delete req.body.otp
  delete req.body.toOtp
  next()
}

module.exports = transferVerifyOtp