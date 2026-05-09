const { prisma } = require("../config/prisma");
const { ok } = require("../utils/apiResponse");

async function alert(req, res) {
  const emergencyAlert = await prisma.emergencyAlert.create({ data: req.body });
  return ok(res, { emergencyAlert }, 201);
}

module.exports = { alert };
