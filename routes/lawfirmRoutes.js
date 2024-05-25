const express = require('express');
const router = express.Router();
const verifyOtp = require('../middleware/verifyOtpMiddleware')
const allowedStatus = require('../middleware/allowedStatus')
const authenticate = require("../middleware/authentication");

const {
  registerLawFirm,
  loginLawFirm,
  getAllLawFirm,
  updateLawFirmStatus
} = require('../controllers/lawfirmController')

router.route('/register/').post(verifyOtp, registerLawFirm)
router.route('/login/').post(allowedStatus(['approve', 'hold', 'admin']), verifyOtp, loginLawFirm)

//admin access only
router.route('/').get(authenticate, allowedStatus(['admin']), getAllLawFirm)
router.route('/status/').post(authenticate, allowedStatus(['admin']), updateLawFirmStatus)

module.exports = router