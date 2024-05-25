const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require("jsonwebtoken");

const LawFirmSchema = new mongoose.Schema({
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
    minlength: 3,
    maxlength: 50,
  },
  status: {
    type: String,
    enum: ['approve', 'deny', 'hold', 'admin'],
    default: 'hold'
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide phone number'],
    //todo: validation
  },
  address:{
    type: String,
  },
  privateKey:{
    type: String,
  },
  createdDate: {
    type: Date
  },
  updatedDate: {
    type: Date
  }
});

LawFirmSchema.methods.createJWT = function () {
  return jwt.sign(
    {lawFirmId: this._id, lawFirmEmail: this.email},
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  )
};

LawFirmSchema.pre('save', function () {
  const now = new Date()
  this.updatedDate = now
  if (!this.createdDate) {
    this.createdDate = now
  }
})

module.exports = mongoose.model('LawFirm', LawFirmSchema)
