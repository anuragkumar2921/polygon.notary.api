const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authentication')
const verifyOtp = require('../middleware/verifyOtpMiddleware')
const verifyOtpTransfer = require('../middleware/transferVerifyOtp')
const allowedStatus = require('../middleware/allowedStatus')

const {
  getAllCopyrightsLawFirm,
  createCopyright,
  getAllCopyrights,
  transferCopyright
} = require('../controllers/copyrightController')

router.route('/lawfirm').get(authenticate, allowedStatus(['approve', 'hold']), getAllCopyrightsLawFirm)
router.route('/').post(authenticate, allowedStatus(['approve']), verifyOtp, createCopyright)
router.route('/transfer/').post(authenticate, allowedStatus(['approve']), verifyOtpTransfer, transferCopyright)
//for admin access only
router.route('/').get(authenticate, allowedStatus(['admin']), getAllCopyrights)

module.exports = router