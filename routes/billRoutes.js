const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authentication')
const allowedStatus = require('../middleware/allowedStatus')
const {
  getLawFirmBills,
  payBill,
  getAllBills
} = require('../controllers/billController')

router.route('/lawfirm/').get(authenticate, allowedStatus(['approve', 'hold']), getLawFirmBills)
router.route('/').post(authenticate, allowedStatus(['approve', 'hold']), payBill)

//for admin access only
router.route('/').get(authenticate, allowedStatus(['admin']), getAllBills)

module.exports = router