const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const sendEmail = async ({to, subject, html, attachments}) => {
  const accessToken = await oAuth2Client.getAccessToken();
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.SENDER_EMAIL,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken,
    },
  })

  return transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to,
    subject,
    html,
    attachments
  })
}

const sendOtpEmail = async (email, otp) => {
  const message = `<p>OPT is: ${otp}</p>`;
  return sendEmail({
    to: email,
    subject: 'OTP Email',
    html: `<h4>Hello,</h4>
        ${message}
        `
  })
}

const sendDocumentRegistrationEmail = async (to, files, ip, type, transactionHash, wordPhrase) => {
  console.log(`Sending document registration email to: ${to}`)
  let message;
  switch (ip) {
    case 'copyright':
      message = `<p>Your ${type} is successfully registered. Please find the registration documents below.
        The transaction hash for the registration is: ${transactionHash}.
        Track transaction here: ${process.env.BLOCK_EXPLORER_BASE_URL + '/tx/' + transactionHash} <p>`;
      break;
    case 'trademark':
      message = `<p>Your ${type} is successfully registered. Please find the registration documents below.
        The transaction hash for the registration is: ${transactionHash}.
        Track transaction here: ${process.env.BLOCK_EXPLORER_BASE_URL + '/tx/' + transactionHash} <p>`;
      if (type === 'Word Mark'){
        message = `<p>Your ${type} is successfully registered. Your word phrase is: ${wordPhrase}.
          The transaction hash for the registration is: ${transactionHash}. 
          Track transaction here: ${process.env.BLOCK_EXPLORER_BASE_URL + '/tx/' + transactionHash} <p>`;
      }
      break;
  }
  return sendEmail({
    to: to,
    subject: 'POLYGON NOTARY REGISTRATION EMAIL',
    html: `<h4>Hello,</h4>
        ${message}
        `,
    attachments: files.map((file) => {
      return {filename: file.name, content: file.data, contentType: file.mimeType};
    })
  })
}

const sendTransferEmail = (to, transactionHash, fromEmail, toEmail, ip) => {
  let message = `<p>${ip} has successfully been transferred from ${fromEmail} to ${toEmail}. The transaction hash for the 
  transfer is : ${transactionHash}. 
  Track transaction here: ${process.env.BLOCK_EXPLORER_BASE_URL + '/tx/' + transactionHash} <p>`;
  return sendEmail({
    to: to,
    subject: 'POLYGON NOTARY REGISTRATION EMAIL',
    html: `<h4>Hello,</h4>
        ${message}
        `,
  })
}

const sendInvoiceEmail = async (to, amount) => {
  console.log(`Sending lawfirm invoice email to: ${to}`)
  const message = `<p>Amount for the date : ${new Date()} is : ${amount} </p>`;
  return sendEmail({
    to: to,
    subject: 'POLYGON NOTARY INVOICE EMAIL',
    html: `<h4>Hello,</h4>
        ${message}
        `,
  })
}

module.exports = {
  sendEmail,
  sendOtpEmail,
  sendDocumentRegistrationEmail,
  sendInvoiceEmail,
  sendTransferEmail
}