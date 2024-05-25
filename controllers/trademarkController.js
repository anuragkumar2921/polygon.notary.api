const errors = require('../exceptions/')
const Trademark = require('../models/Trademark')
const Client = require('../models/Client')
const {StatusCodes} = require('http-status-codes')
const {uploadDocument, hash} = require("../utils/");
const {BadRequestError, NotFoundError} = require("../exceptions");
const {blockchainService, mailService} = require("../services");
const ChangeLog = require('../models/ChangeLog')


const createTrademark = async (req, res) => {
  const {email, type} = req.body
  const {lawFirmId} = req.payload
  const client = await Client.findOne({email: email, lawFirm: {$in: [lawFirmId]}})
  createTrademarkValidation(req, client)
  let proofHash, transactionResponse, assetHash, files=[];
  const registrationDate = new Date()
  switch (type) {
    case 'Word Mark':
      assetHash = hash.getWordHash(req.body.wordmarkPhrase)
      proofHash = await fetchProofHash(type, req, email, registrationDate, assetHash)
      break;
    case 'Service Mark':
    case 'Others':
    case 'Logo and Symbol':
    case 'Sound Mark':
      files = Array.isArray(req.files.multipartFiles) ? req.files.multipartFiles : [req.files.multipartFiles]
      assetHash = hash.getFileHash(files)
      proofHash = await fetchProofHash(type, req, email, registrationDate, assetHash)
      await uploadDocument(files)
      req.body.s3Key = files.map(file => file.name)
      break;
    default:
      throw new BadRequestError('Invalid type.. Please try with a valid trademark type !!')
  }
  transactionResponse = await blockchainService.pushToBlockchain(assetHash, proofHash)
  req.body.status = 'pushedToBlockchain'
  await setAndCreateTrademark(req, proofHash, client._id, lawFirmId, assetHash, transactionResponse, registrationDate)
  mailService.sendDocumentRegistrationEmail(email, files, 'trademark', type, transactionResponse.transactionHash, req.body.wordmarkPhrase)
  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      receiptId: transactionResponse.transactionHash
    },
    message: 'Document successfully uploaded'
  })
}

const createTrademarkValidation = (req, client) => {
  const {type, email} = req.body
  if (!client) {
    throw new errors.NotFoundError(`Client: ${email} not found`)
  }
  if (!type) {
    throw new errors.BadRequestError('type field is necessary')
  }
  switch (type) {
    case 'Word Mark':
      if (req.files) {
        throw new errors.BadRequestError('File Uploaded not allowed in case of wordmark');
      }
      if (!req.body.wordmarkPhrase) {
        throw new errors.BadRequestError('wordmarkPhrase not found')
      }
      break;
    case 'Service Mark':
    case 'Others':
    case 'Logo and Symbol':
    case 'Sound Mark':
      if (!req.files) {
        throw new errors.BadRequestError('No File Uploaded');
      }
      if (req.body.wordmarkPhrase) {
        throw new errors.BadRequestError('wordmarkPhrase not required')
      }
      break;
    default:
      throw new BadRequestError('Invalid type.. Please try with a valid trademark type !!')
  }
}

const fetchProofHash = async (type, req, email, registrationDate, assetHash) => {
  let trademark = await Trademark.findOne({assetHash: assetHash})
  if (trademark && trademark.status !== 'failed') {
    throw new BadRequestError('Trademark with the same hash already exist, Please try different phrase')
  }
  return hash.getCanonicalJsonHash(
    assetHash, getProofPayload(email, registrationDate, type, req.body.documentName)
  )
}

const setAndCreateTrademark = async (req, registeredHash, clientId, lawFirmId, assetHash, transactionResponse,
                                     registrationDate) => {
  req.body.registeredDocumentHash = registeredHash
  req.body.client = clientId
  req.body.lawFirm = lawFirmId
  req.body.assetHash = assetHash
  req.body.transactionHash = transactionResponse.transactionHash
  req.body.documentId = transactionResponse.documentId
  req.body.registrationDate = registrationDate
  await Trademark.create(req.body)
  await ChangeLog.create({
    registrationDate: registrationDate,
    type: 'trademark',
    transactionHash: transactionResponse.transactionHash,
    assetHash: assetHash,
    client: clientId
  })
}

const getAllTrademarksLawFirm = async (req, res) => {
  const {lawFirmId, lawFirmEmail} = req.payload
  const trademarkList = await Trademark.find({lawFirm: lawFirmId})
    .select('documentName registrationDate status type wordmarkPhrase')
    .populate('client', 'email name phoneNumber')
  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      trademarkList: trademarkList
    },
    message: `All the trademark for the lawFirm: ${lawFirmEmail} successfully fetched`
  })
}

const getAllTrademark = async (req, res) => {
  const trademarkList = await Trademark.find()
    .select('documentName registrationDate status type')
    .populate('client', 'email name phoneNumber')
    .populate('lawFirm', 'email name phoneNumber')

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      trademarkList: trademarkList
    },
    message: `All the trademark successfully fetched`
  })
}

const transferTrademark = async (req, res) => {
  const {receiptId, toEmail, email} = req.body
  if (!receiptId) {
    throw new BadRequestError('ReceiptId cannot be empty')
  }
  const {lawFirmId} = req.payload
  const toClient = await Client.findOne({email: toEmail, lawFirm: {$in: [lawFirmId]}})
  const fromClient = await Client.findOne({email: email, lawFirm: {$in: [lawFirmId]}})
  if (!toClient || !fromClient) {
    throw new NotFoundError("Client not found for the lawfirm")
  }
  const trademark = await Trademark.findOne({lawFirm: lawFirmId, transactionHash: receiptId, client: fromClient._id})
  if (!trademark) {
    throw new BadRequestError(`Trademark: ${receiptId} does not exist for either the lawfirm or the client`)
  }
  const newRegistrationDate = new Date()
  const newProofHash = hash.getCanonicalJsonHash(
    trademark.assetHash, getProofPayload(email, newRegistrationDate, trademark.type, trademark.documentName)
  )
  const transactionHash = await blockchainService.transferBlockchain(trademark.documentId, newProofHash)
  await updateTrademark(trademark, newRegistrationDate, transactionHash, newProofHash, toClient._id)
  mailService.sendTransferEmail(toClient.email, transactionHash, fromClient.email, toClient.email, 'Trademark');
  mailService.sendTransferEmail(fromClient.email, transactionHash, fromClient.email, toClient.email, 'Trademark');
  res.status(StatusCodes.OK).json({
    success: true,
    receiptId: transactionHash,
    message: `Trademark successfully transferred to : ${toEmail}`
  })
}

const updateTrademark = async (trademark, newRegistrationDate, transactionHash, newProofHash, clientId) => {
  trademark.registrationDate = newRegistrationDate
  trademark.transactionHash = transactionHash
  trademark.registeredDocumentHash = newProofHash
  trademark.client = clientId
  trademark.save()
  await ChangeLog.create({
    registrationDate: newRegistrationDate,
    type: 'trademark',
    transactionHash: transactionHash,
    assetHash: trademark.assetHash,
    client: clientId
  })
}

const getProofPayload = (email, registrationDate, type, trademarkName) => ({
  email: email,
  registrationDate: registrationDate,
  type: type,
  trademarkName: trademarkName
})

module.exports = {
  createTrademark,
  getAllTrademarksLawFirm,
  getAllTrademark,
  transferTrademark
}