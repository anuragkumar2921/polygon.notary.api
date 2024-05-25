const createHash = require('./createHash');
const uploadDocument = require("./uploadDocument");
const updateBill = require('./updateBill')
const hash = require("./createCanonicalJson");

module.exports = {
  uploadDocument,
  createHash,
  updateBill,
  hash
};