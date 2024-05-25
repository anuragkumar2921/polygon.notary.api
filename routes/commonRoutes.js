const express = require('express');
const router = express.Router();
const authenticate = require("../middleware/authentication");
const allowedStatus = require("../middleware/allowedStatus");

const {
  sendOtp,
  monthlyRegistrationLawFirm,
  monthlyRegistration,
  verifyDocument,
  verifyDocumentHash,
  fetchChangeLog,
  lawFirmRegistrationDetails
} = require('../controllers/commonController')

router.route('/send-otp/:email/').get(sendOtp)
router.route('/registration-count/lawfirm/').get(authenticate, allowedStatus(['approve', 'hold']), monthlyRegistrationLawFirm)

//admin access
router.route('/registration-count/').get(authenticate, allowedStatus(['admin']), monthlyRegistration)
router.route('/registration-details-lawfirm/').post(authenticate, allowedStatus(['admin']), lawFirmRegistrationDetails)


//public api
router.route('/document/').post(verifyDocument)
router.route('/document/hash/').post(verifyDocumentHash)
router.route('/change-log/').post(fetchChangeLog)

module.exports = router
