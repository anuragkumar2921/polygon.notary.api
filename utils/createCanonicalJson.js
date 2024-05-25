const {canonicalize} = require('json-canonicalize');
const createHash = require("./createHash");

const getCanonicalJsonHash = (fileHash, payload = {}) => {
  const canonicalJson = canonicalize({
    ...payload,
    fileHash: fileHash
  })
  return createHash(canonicalJson)
}

const getFileHash = (files) => {
  let hashArr = []
  files.forEach(file => {
    const dataBuffer = file.data
    const hash = createHash(dataBuffer)
    hashArr.push(hash)
  })
  const canonicalJson = canonicalize({
    files: hashArr.sort()
  })
  return createHash(canonicalJson)
}

const getWordHash = (phrase) => {
  const canonicalJson = canonicalize({
    phrase
  })
  return createHash(canonicalJson)
}

module.exports = {
  getCanonicalJsonHash,
  getFileHash,
  getWordHash
}