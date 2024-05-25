const {otpService} = require("../services/");
const errors = require("../exceptions/");

const verifyOtp = async (req, res, next) => {
  const {email, otp} = req.body
  if (!email || !otp) {
    throw new errors.BadRequestError('Please provide email and otp');
  }
  const isVerified = await otpService.verifyOtp(email, otp)
  if (!isVerified) {
    throw new errors.ForbiddenError('OTP invalid !!')
  }
  delete req.body.otp
  next()
}

module.exports = verifyOtp