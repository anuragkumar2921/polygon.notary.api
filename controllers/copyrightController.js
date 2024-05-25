const errors = require('../exceptions/')
const Copyright = require('../models/Copyright')
const Client = require('../models/Client')
const {StatusCodes} = require('http-status-codes')
const {hash} = require("../utils/");
const {BadRequestError, NotFoundError} = require("../exceptions");
const {blockchainService, mailService} = require("../services");
const ChangeLog = require('../models/ChangeLog')


const createCopyright = async (req, res) => {
  const {email, type} = req.body
  const {lawFirmId} = req.payload
  const registrationDate = new Date()
  const client = await Client.findOne({email: email, lawFirm: {$in: [lawFirmId]}})
  createCopyrightValidation(req, type, client)
  const files = Array.isArray(req.files.multipartFiles) ? req.files.multipartFiles : [req.files.multipartFiles]
  const fileHash = hash.getFileHash(files)
  const proofHash = await fetchProofHash(type, req, email, registrationDate, fileHash)
  const transactionResponse = await blockchainService.pushToBlockchain(fileHash, proofHash)
  req.body.status = 'pushedToBlockchain'
  await setAndCreateCopyright(req, proofHash, files, client._id, lawFirmId, fileHash, transactionResponse, registrationDate);
  mailService.sendDocumentRegistrationEmail(email, files, 'copyright', type, transactionResponse.transactionHash)
  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      receiptId: transactionResponse.transactionHash
    },
    message: 'Document successfully uploaded'
  })
}

const setAndCreateCopyright = async (req, proofHash, files, clientId, lawFirmId, fileHash, transactionResponse,
                                     registrationDate) => {
  req.body.s3Key = files.map(file => file.name)
  req.body.registeredDocumentHash = proofHash
  req.body.client = clientId
  req.body.lawFirm = lawFirmId
  req.body.fileHash = fileHash
  req.body.transactionHash = transactionResponse.transactionHash
  req.body.documentId = transactionResponse.documentId
  req.body.registrationDate = registrationDate
  await Copyright.create(req.body)
  await ChangeLog.create({
    registrationDate: registrationDate,
    type: 'copyright',
    transactionHash: transactionResponse.transactionHash,
    assetHash: fileHash,
    client: clientId
  })
}

const createCopyrightValidation = (req, type, client) => {
  if (!client) {
    throw new errors.NotFoundError(`Client: ${email} not found for the lawfirm`)
  }
  if (!req.files) {
    throw new errors.BadRequestError('No File Uploaded');
  }
  if (!type) {
    throw new errors.BadRequestError('type field is necessary')
  }
}

const fetchProofHash = async (type, req, email, registrationDate, fileHash) => {
  let copyright = await Copyright.findOne({fileHash: fileHash})
  if (copyright && copyright.status !== 'failed') {
    throw new BadRequestError('Document with the same hash already exist, Please try different document')
  }
  return  hash.getCanonicalJsonHash(
    fileHash, getProofPayload(email, registrationDate, type, req.body.documentName)
  )
}

const getAllCopyrightsLawFirm = async (req, res) => {
  const {lawFirmId, lawFirmEmail} = req.payload
  const copyrightList = await Copyright.find({lawFirm: lawFirmId})
    .select('documentName registrationDate status type')
    .populate('client', 'email name phoneNumber')
  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      copyrightList: copyrightList
    },
    message: `All the copyright for the lawFirm: ${lawFirmEmail} successfully fetched`
  })
}

const getAllCopyrights = async (req, res) => {
  const copyrightList = await Copyright.find()
    .select('documentName registrationDate status type')
    .populate('lawFirm', 'email name phoneNumber')
    .populate('client', 'email name phoneNumber')

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      copyrightList: copyrightList
    },
    message: `All the copyrights successfully fetched`
  })
}

const transferCopyright = async (req, res) => {
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
  const copyright = await Copyright.findOne({lawFirm: lawFirmId, transactionHash: receiptId, client: fromClient._id})
  if (!copyright) {
    throw new BadRequestError(`Copyright: ${receiptId} does not exist for either the lawfirm or the client`)
  }
  const newRegistrationDate = new Date()
  const newProofHash = hash.getCanonicalJsonHash(
    copyright.fileHash, getProofPayload(email, newRegistrationDate, copyright.type, copyright.documentName)
  )
  const transactionHash = await blockchainService.transferBlockchain(copyright.documentId, newProofHash)
  await updateCopyright(copyright, newRegistrationDate, transactionHash, newProofHash, toClient._id)
  mailService.sendTransferEmail(toClient.email, transactionHash, fromClient.email, toClient.email, 'Copyright')
  mailService.sendTransferEmail(fromClient.email, transactionHash, fromClient.email, toClient.email, 'Copyright')
  res.status(StatusCodes.OK).json({
    success: true,
    receiptId: transactionHash,
    message: `Copyright successfully transferred to : ${toEmail}`
  })
}

const updateCopyright = async (copyright, newRegistrationDate, transactionHash, proofHash, clientId) => {
  copyright.client = clientId
  copyright.transactionHash = transactionHash
  copyright.registeredDocumentHash = proofHash
  copyright.registrationDate = newRegistrationDate
  copyright.save()
  await ChangeLog.create({
    registrationDate: newRegistrationDate,
    type: 'copyright',
    transactionHash: transactionHash,
    assetHash: copyright.fileHash,
    client: clientId
  })
}

const getProofPayload = (email, registrationDate, type, copyrightName) => ({
  email: email,
  registrationDate: registrationDate,
  type: type,
  copyrightName: copyrightName
})

module.exports = {
  createCopyright,
  getAllCopyrightsLawFirm,
  getAllCopyrights,
  transferCopyright
}