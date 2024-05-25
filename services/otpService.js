const errors = require('../exceptions/');
const cache = require('../services/cacheService')
const mailService = require('../services/mailService')

const triggerOtp = async (email) => {
  let otp
  const cacheKey = `OTP_${email}`
  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    console.log('got cached data');
    otp = cachedData
  } else {
    otp = generateOtp()
    const ttl = process.env.OTP_EXPIRY || 300
    await cache.saveWithTtl(cacheKey, otp, ttl)
  }
  console.log('!!! sending email !!!');
  await mailService.sendOtpEmail(email, otp)
  console.log('Email successfully sent')
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
}

const verifyOtp = async (email, otp) => {
  if (!email || !otp) {
    throw new errors.BadRequestError('Please provide email and otp')
  }
  const cacheKey = `OTP_${email}`
  const userOtp = await cache.get(cacheKey)
  if (otp == userOtp) {
    await cache.remove(cacheKey)
    return true
  }
  return false
};

module.exports = {
  triggerOtp,
  verifyOtp
}