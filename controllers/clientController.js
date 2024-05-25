const errors = require('../exceptions/')
const Client = require('../models/Client')
const {StatusCodes} = require('http-status-codes')

const getClientByEmail = async (req, res) => {
  const {lawFirmId, lawFirmEmail} = req.payload
  const clientEmail = req.params.email
  const client = await Client.findOne({email: clientEmail, lawFirm: {$in: [lawFirmId]}})
    .select('email name phoneNumber ')
  if (!client) {
    throw new errors.NotFoundError('Client not found for the law firm')
  }
  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      clientDetails: client
    },
    message: 'Client successfully fetched'
  })
};

const createClient = async (req, res) => {
  const {lawFirmId, lawFirmEmail} = req.payload
  const clientEmail = req.body.email
  let client = await Client.findOne({email: clientEmail})
  console.log(`Client already exist with the emailId: ${clientEmail}`)
  if (!client) {
    req.body.lawFirm = [lawFirmId]
    await Client.create(req.body)
  } else if (!client.lawFirm.includes(lawFirmId)) {
    client.lawFirm.push(lawFirmId)
    client.save()
  }
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Client successfully created'
  })
}

const getAllClients = async (req, res) => {
  const {lawFirmId, lawFirmEmail} = req.payload
  const clientList = await Client.find({lawFirm: {$in: [lawFirmId]}})
    .select('email name phoneNumber createdDate')
  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      clientList: clientList
    },
    message: `All the clients for the lawFirm: ${lawFirmEmail} successfully fetched`
  })
}

module.exports = {
  getClientByEmail,
  createClient,
  getAllClients
}