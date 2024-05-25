const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authentication')
const allowedStatus = require('../middleware/allowedStatus')
const verifyOtp = require("../middleware/verifyOtpMiddleware");

const {
  getClientByEmail,
  createClient,
  getAllClients,
} = require('../controllers/clientController')

router.route('/:email/').get(authenticate, allowedStatus(['approve', 'hold']), getClientByEmail)
router.route('/').post(authenticate, allowedStatus(['approve']), createClient)
router.route('/').get(authenticate, allowedStatus(['approve', 'hold']), getAllClients)

module.exports = router