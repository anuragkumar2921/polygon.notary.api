const {s3Service} = require("../services/");
const {S3Exception} = require("../exceptions");

const uploadDocument = async (files) => {
  const image_file_extension = ['jpg', 'png', 'jpeg']
  try {
    for (const file of files) {
      const fileExtension = file.name.split('.').pop()
      if (image_file_extension.includes(fileExtension)) {
        const dataBuffer = file.data
        console.log(`FILE: ${file.name} upload to s3 started`)
        await s3Service.uploadToS3(dataBuffer, file.name)
        console.log(`FILE: ${file.name} upload to s3 successful`)
      }
    }
  } catch (err) {
    console.error('Error while uploading file', err)
    throw new S3Exception('Error while uploading file to S3')
  }
}

module.exports = uploadDocument