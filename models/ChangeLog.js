const mongoose = require('mongoose')

const ChangeLogSchema = new mongoose.Schema({
  registrationDate: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['copyright', 'trademark'],
    required: true
  },
  transactionHash: {
    type: String,
    required: true
  },
  assetHash: {
    type: String,
    required: true
  },
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: true,
  }
})

module.exports = mongoose.model('ChangeLog', ChangeLogSchema)
