const { prisma } = require("../config/prisma");
const { ok } = require("../utils/apiResponse");

async function list(req, res) {
  const notifications = await prisma.notification.findMany({ take: 100, orderBy: { createdAt: "desc" } });
  return ok(res, { notifications });
}

module.exports = { list };
