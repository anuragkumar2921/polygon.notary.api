const cron = require('node-cron');
const mongoose = require("mongoose");
const Copyright = require('../models/Copyright')
const Trademark = require('../models/Trademark')
const LawFirm = require('../models/LawFirm')
const Bill = require("../models/Bill");
const {mailService} = require("../services");

const billGenerationCron = () =>
  cron.schedule('0 0 1 * *', async () => {
    console.log('---------------------');
    console.log('Running Cron Job');
    console.log('Generating bill for all the lawfirms')
    const lawFirmList = await LawFirm.find({status: ['approve']})
    await Promise.all(lawFirmList.map(async (lawFirm) => {
      const [{count: trademarkCount},] = await fetchRegistrationCount(Copyright, lawFirm._id)
      const [{count: copyrightCount},] = await fetchRegistrationCount(Trademark, lawFirm._id)
      console.log(`${lawFirm.email}__${copyrightCount}`)
      console.log(`${lawFirm.email}__${trademarkCount}`)

      const payableAmount = copyrightCount * 350 + trademarkCount * 250
      const bill = await Bill.create({
        lawFirm: lawFirm._id,
        trademarkCount: trademarkCount,
        copyrightCount: copyrightCount,
        billAmount: payableAmount,
      })
      mailService.sendInvoiceEmail(lawFirm.email, payableAmount)
    }))
  });

const fetchRegistrationCount = async (T, lawFirmId = undefined) => {
  const now = new Date()
  const previousMonth = new Date(new Date().setMonth(new Date().getMonth() - 1));
  return await T.aggregate([
    {
      $match: {
        ...(lawFirmId) && {lawFirm: mongoose.Types.ObjectId(lawFirmId)},
        registrationDate: {$gte: previousMonth, $lte: now}
      }
    },
    {
      $project: {
        "month": {
          $month: "$registrationDate"
        }
      }
    },
    // Group by month and get the count
    {
      $group: {
        _id: {
          month: "$month",
        },
        "count": {
          $sum: 1
        }
      }
    }
  ]).exec()
}

module.exports = billGenerationCron()