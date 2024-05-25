const mongoose = require('mongoose')

const BillSchema = new mongoose.Schema({
  lawFirm: {
    type: mongoose.Schema.ObjectId,
    ref: 'LawFirm',
    required: true,
  },
  trademarkCount: {
    type: Number,
    default: 0,
  },
  copyrightCount: {
    type: Number,
    default: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  },
  billAmount: {
    type: Number,
  },
  createdDate: {
    type: Date
  },
  paymentDate: {
    type: Date
  }
})

module.exports = mongoose.model('Bill', BillSchema)
