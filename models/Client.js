const mongoose = require('mongoose')
const validator = require('validator')

const ClientSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide email'],
    validate: {
      validator: validator.isEmail,
      message: 'Please provide valid email',
    },
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide name'],
  },
  phoneNumber: {
    type: String,
    required: false,
    //todo: validation
  },
  createdDate: {
    type: Date,
    default: new Date()
  },
  lawFirm: [{
    type: mongoose.Schema.ObjectId,
    ref: 'LawFirm',
    required: true,
  }],
})

module.exports = mongoose.model('Client', ClientSchema)
