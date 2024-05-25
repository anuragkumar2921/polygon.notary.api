const S3 = require('aws-sdk/clients/s3')
const s3Config = require('../configs/s3Config')

const s3 = new S3(s3Config)

const uploadToS3 = async (file, key) => {
  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: file
  }
  await s3.upload(uploadParams).promise()
  console.log('S3: File successfully uploaded to s3')
}

const getFromS3 = async (key) => {
  const downloadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key
  }
  return s3.getObject(downloadParams).createReadStream()
}

module.exports = {
  uploadToS3,
  getFromS3
}