const errors = require("../exceptions/");
const LawFirm = require("../models/LawFirm");

const allowedStatus = (statusList) =>
  async (req, res, next) => {
    let email
    if (req.payload) {
      email = req.payload.lawFirmEmail
    } else if (req.params.email) {
      email = req.params.email
    } else if (req.body.email) {
      email = req.body.email
    }

    if (!email) {
      throw new errors.BadRequestError('Please provide email')
    }
    const lawFirm = await LawFirm.findOne({email})
    if (!lawFirm) {
      throw new errors.NotFoundError('Lawfirm does not exist, Please register to proceed')
    }
    if (!statusList.includes(lawFirm.status)) {
      throw new errors.ForbiddenError('This route is not allowed for the current state')
    }
    next()
  };

module.exports = allowedStatus
