const { otpService, blockchainService } = require("../services/");
const { StatusCodes } = require("http-status-codes");
const Copyright = require("../models/Copyright");
const Trademark = require("../models/Trademark");
const Client = require("../models/Client");
const mongoose = require("mongoose");
const errors = require("../exceptions/");
const { hash } = require("../utils/");
const ChangeLog = require("../models/ChangeLog");
const { BadRequestError } = require("../exceptions");

const sendOtp = async (req, res) => {
  const email = req.params.email;
  otpService.triggerOtp(email);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Otp successfully triggered",
  });
};

const monthlyRegistrationLawFirm = async (req, res) => {
  const { lawFirmId, lawFirmEmail } = req.payload;
  const monthYearData = await fetchMonthYearData(lawFirmId);
  res.status(StatusCodes.OK).json({
    success: true,
    data: monthYearData,
    message: `monthly registration successfully fetched for the email: ${lawFirmEmail}`,
  });
};

const fetchMonthYearData = async (lawFirmId = undefined) => {
  const copyrights = await fetchMonthYearCount(Copyright, lawFirmId);
  const trademarks = await fetchMonthYearCount(Trademark, lawFirmId);
  let copyrightMap = mapMonthYearKey(copyrights);
  let trademarkMap = mapMonthYearKey(trademarks);
  return Object.values(
    [...copyrightMap, ...trademarkMap].reduce(
      (acc, { count, monthYear, month, year }) => {
        acc[monthYear] = {
          month,
          year,
          count: (acc[monthYear] ? acc[monthYear].count : 0) + count,
        };
        return acc;
      },
      {}
    )
  );
};

const fetchMonthYearCount = async (
  T,
  lawFirmId = undefined,
  to = undefined,
  from = undefined
) => {
  if (!to || !from) {
    to = new Date();
    from = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
  }
  return await T.aggregate([
    {
      $match: {
        ...(lawFirmId && { lawFirm: mongoose.Types.ObjectId(lawFirmId) }),
        registrationDate: { $gte: new Date(from), $lte: new Date(to) },
      },
    },
    {
      $lookup: {
        from: "clients",
        localField: "client",
        foreignField: "_id",
        as: "clientDetail",
      },
    },
    {
      $unwind: {
        path: "$clientDetail",
        includeArrayIndex: "0",
      },
    },
    {
      $project: {
        year: {
          $year: "$registrationDate",
        },
        month: {
          $month: "$registrationDate",
        },
        clientEmail: "$clientDetail.email",
      },
    },
    {
      $group: {
        _id: {
          year: "$year",
          month: "$month",
          clientEmail: "$clientEmail",
        },
        count: {
          $sum: 1,
        },
      },
    },
    {
      $group: {
        _id: {
          year: "$_id.year",
          month: "$_id.month",
        },
        totalMonthlyRegistration: {
          $sum: "$count",
        },
        clients: {
          $push: {
            email: "$_id.clientEmail",
            registrationCount: "$count",
          },
        },
      },
    },
  ]).exec();
};

const mapMonthYearKey = (list) => {
  return list.map((item) => {
    const { _id, totalMonthlyRegistration } = item;
    const { year, month } = _id;
    return {
      monthYear: month + "_" + year,
      month: month,
      year: year,
      count: totalMonthlyRegistration,
    };
  });
};

const monthlyRegistration = async (req, res) => {
  const monthYearData = await fetchMonthYearData();
  res.status(StatusCodes.OK).json({
    success: true,
    data: monthYearData,
    message: "monthly registration successfully fetched",
  });
};

const verifyDocumentHash = async (req, res) => {
  const { documentHash, documentType } = req.body;
  if (!documentHash || !documentType) {
    throw new errors.BadRequestError(
      "Either Document type or Document hash is missing"
    );
  }
  let registration;
  switch (documentType) {
    case "copyright":
      registration = await Copyright.findOne({ transactionHash: documentHash })
        .select(
          "documentName registrationDate status type transactionHash s3Key"
        )
        .populate("client", "email name");
      //TODO generate the hash
      // const _documentHash = registration.fileHash;
      const { type, documentName, client, registrationDate, fileHash } =
        registration;
        const { email } = await Client.findOne({
          _id: client,
        })
      const _proofHash = await fetchProofHash(
        type,
        {documentName},
        email,
        registrationDate,
        fileHash
      );
      const { documentHash, proofHash } =
        await blockchainService.getDocumentHash(registration.documentId);
      // TODO crosscheck it with blockchain
      if(_proofHash===proofHash){
        console.log("proof hash matched");
      }
      if(documentHash===documentHash){
        console.log("document hash matched");
      }
      break;
    case "trademark":
      registration = await Trademark.findOne({ transactionHash: documentHash })
        .select(
          "documentName registrationDate status type transactionHash s3Key wordmarkPhrase"
        )
        .populate("client", "email name");
      break;
    default:
      throw new BadRequestError("Invalid documentType");
  }
  if (!registration) {
    throw new errors.BadRequestError("Registration not found");
  }
  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      registrationDetails: registration,
    },
    message: `Registration Details successfully fetched`,
  });
};

const verifyDocument = async (req, res) => {
  const documentType = req.body.documentType;
  if (!documentType) {
    throw new errors.BadRequestError("Document type is missing");
  }
  if (!req.files) {
    throw new errors.BadRequestError("No files uploaded");
  }
  const files = Array.isArray(req.files.multipartFiles)
    ? req.files.multipartFiles
    : [req.files.multipartFiles];

  const fileHash = hash.getFileHash(files);
  let registration;
  switch (documentType) {
    case "copyright":
      registration = await Copyright.findOne({ fileHash: fileHash })
        .select(
          "documentName registrationDate status type transactionHash s3Key"
        )
        .populate("client", "email name");
      break;
    case "trademark":
      registration = await Trademark.findOne({ assetHash: fileHash })
        .select(
          "documentName registrationDate status type transactionHash s3Key wordmarkPhrase"
        )
        .populate("client", "email name");
      break;
    default:
      throw new BadRequestError("Invalid document type");
  }
  if (!registration) {
    throw new errors.BadRequestError("Registration not found");
  }
  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      registrationDetails: registration,
    },
    message: `Registration Details successfully fetched`,
  });
};

const fetchChangeLog = async (req, res) => {
  const { receiptId, documentType } = req.body;
  if (!receiptId || !documentType) {
    throw new errors.BadRequestError(
      "Either Document type or receiptId is missing"
    );
  }

  let registration, assetHash;
  switch (documentType) {
    case "copyright":
      registration = await Copyright.findOne({ transactionHash: receiptId });
      assetHash = registration ? registration.fileHash : null;
      break;
    case "trademark":
      registration = await Trademark.findOne({ transactionHash: receiptId });
      assetHash = registration ? registration.assetHash : null;
      break;
    default:
      throw new BadRequestError("Invalid document type");
  }
  if (!registration) {
    throw new errors.BadRequestError(
      `${documentType} not found for the provided receipt id: ${receiptId}`
    );
  }

  const changeLogs = await ChangeLog.find({ assetHash: assetHash })
    .select("registrationDate type transactionHash client ")
    .populate("client", "email name")
    .sort({ registrationDate: -1 });

  res.status(StatusCodes.OK).json({
    success: true,
    data: changeLogs,
    message: `change log successfully fetched for the transaction hash: ${receiptId}`,
  });
};

const lawFirmRegistrationDetails = async (req, res) => {
  const { lawfirmId, from, to } = req.body;
  const copyrights = await fetchMonthYearCount(Copyright, lawfirmId, to, from);
  const trademarks = await fetchMonthYearCount(Trademark, lawfirmId, to, from);
  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      copyrights,
      trademarks,
    },
    message: `law firm registration details successfully fetched for the law firm id : ${lawfirmId}`,
  });
};

module.exports = {
  sendOtp,
  monthlyRegistrationLawFirm,
  monthlyRegistration,
  verifyDocumentHash,
  verifyDocument,
  fetchChangeLog,
  lawFirmRegistrationDetails,
};
