const {otpService} = require('../services/')
const errors = require('../exceptions/')
const LawFirm = require('../models/LawFirm')
const {StatusCodes} = require('http-status-codes')
const Copyright = require("../models/Copyright");

const registerLawFirm = async (req, res) => {
  const {email, name, phoneNumber,} = req.body
  let lawFirm = await LawFirm.findOne({email})
  if (lawFirm) {
    throw new errors.BadRequestError('Lawfirm already exists with the email..Please login to continue')
  }
  if (!lawFirm) {
    lawFirm = await LawFirm.create({email: email, name: name, phoneNumber: phoneNumber})
  }
  const token = lawFirm.createJWT()
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Lawfirm successfully created',
    data: {
      status: lawFirm.status,
      accessToken: token
    }
  })
};

const loginLawFirm = async (req, res) => {
  const {email} = req.body
  const lawFirm = await LawFirm.findOne({email});
  if (!lawFirm) {
    throw new errors.NotFoundError('Lawfirm does not exist with the provided email, Please register to proceed');
  }
  const token = lawFirm.createJWT()
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Law Firm successfully logged-in',
    data: {
      status: lawFirm.status,
      accessToken: token
    }
  })
};

const getAllLawFirm = async (req, res) => {
  const lawFirmList = await LawFirm.find({status: ['approve', 'deny', 'hold']})
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Law Firm successfully fetched',
    data: {
      lawFirmList: lawFirmList
    }
  })
};

const updateLawFirmStatus = async (req, res) => {
  const {lawFirmId, status} = req.body
  await LawFirm.find({_id: lawFirmId}).update({status: status})
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Law Firm successfully updated',
  })
};

module.exports = {
  loginLawFirm,
  registerLawFirm,
  getAllLawFirm,
  updateLawFirmStatus
}