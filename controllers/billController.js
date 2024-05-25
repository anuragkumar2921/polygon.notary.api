const Bill = require('../models/Bill')
const {StatusCodes} = require('http-status-codes')

const getLawFirmBills = async (req, res) => {
  const {lawFirmId} = req.payload
  const bills = await Bill.find({lawFirm: lawFirmId})
    .select('trademarkCount copyrightCount paymentStatus billAmount paymentDate billMonth')
    .lean()

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      bills: bills
    },
    message: 'Bills successfully fetched'
  })
};

const payBill = async (req, res) => {
  const {lawFirmId, billId} = req.payload
  const unpaidBill = await Bill.findOne({lawFirm: lawFirmId, paymentStatus: 'unpaid', _id: billId})
  unpaidBill.paymentStatus = 'paid'
  unpaidBill.paymentDate = new Date()
  unpaidBill.save()

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Bill successfully paid'
  })
};

const getAllBills = async (req, res) => {
  const bills = await Bill.find()
    .select('trademarkCount copyrightCount paymentStatus paymentDate paidAmount billMonth')
    .populate('lawFirm', 'email name')
    .lean()

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      bills: bills
    },
    message: 'Bills successfully fetched'
  })
}

module.exports = {
  getLawFirmBills,
  payBill,
  getAllBills
}