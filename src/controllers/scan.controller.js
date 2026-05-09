const scanService = require("../services/scan.service");
const { ok } = require("../utils/apiResponse");

async function track(req, res) {
  const scan = await scanService.trackScan({ ...req.validated.body, scannerIp: req.ip });
  return ok(res, { scan }, 201);
}

module.exports = { track };
