const Bill = require("../models/Bill");

const updateBill = async (lawFirmId, documentType) => {
  let bill = await Bill.findOne({lawFirm: lawFirmId, paymentStatus: 'unpaid'})
  if (!bill) {
    bill = await Bill.create({lawFirm: lawFirmId, paymentDate: new Date()})
  }
  if (documentType === 'copyright') {
    bill.copyrightCount++
  } else if (documentType === 'trademark') {
    bill.trademarkCount++
  }
  bill.save()
  console.log('successfully updated the bill')
}

module.exports = updateBill