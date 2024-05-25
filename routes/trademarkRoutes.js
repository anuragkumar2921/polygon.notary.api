const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authentication')
const verifyOtp = require('../middleware/verifyOtpMiddleware')
const verifyOtpTransfer = require('../middleware/transferVerifyOtp')
const allowedStatus = require('../middleware/allowedStatus')

const {
  createTrademark,
  getAllTrademarksLawFirm,
  getAllTrademark,
  transferTrademark
} = require('../controllers/trademarkController')

router.route('/lawfirm').get(authenticate, allowedStatus(['approve', 'hold']), getAllTrademarksLawFirm)
router.route('/').post(authenticate, allowedStatus(['approve']), verifyOtp, createTrademark)
router.route('/transfer/').post(authenticate, allowedStatus(['approve']), verifyOtpTransfer, transferTrademark)

//for admin access only
router.route('/').get(authenticate, allowedStatus(['admin']), getAllTrademark)

module.exports = router