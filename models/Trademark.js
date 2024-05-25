const mongoose = require('mongoose')
const validator = require('validator')

const TrademarkSchema = new mongoose.Schema({
  s3Key: [{
    type: String,
  }],
  documentName: {
    type: String,
  },
  registrationDate: {
    type: Date,
    required: true
  },
  registeredDocumentHash: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'failed', 'pushedToBlockchain'],
    default: 'pending',
  },
  wordmarkPhrase: {
    type: String
  },
  type: {
    type: String,
    enum: ['Logo and Symbol', 'Service Mark', 'Sound Mark', 'Word Mark', 'Others'],
    required: true
  },
  assetHash: {
    type: String,
  },
  transactionHash: {
    type: String,
    required: true
  },
  documentId: {
    type: String,
    required: true
  },
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: true,
  },
  lawFirm: {
    type: mongoose.Schema.ObjectId,
    ref: 'LawFirm',
    required: true,
  },
})

module.exports = mongoose.model('Trademark', TrademarkSchema)
