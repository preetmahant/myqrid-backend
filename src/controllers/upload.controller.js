const { prisma } = require("../config/prisma");
const { ok } = require("../utils/apiResponse");

async function createFileRecord(req, res) {
  const file = await prisma.file.create({ data: req.body });
  return ok(res, { file }, 201);
}

module.exports = { createFileRecord };
