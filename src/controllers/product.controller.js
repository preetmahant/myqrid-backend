const { prisma } = require("../config/prisma");
const { ok } = require("../utils/apiResponse");

async function list(req, res) {
  const products = await prisma.product.findMany({ where: { deletedAt: null, isActive: true }, take: 100, orderBy: { createdAt: "desc" } });
  return ok(res, { products });
}

async function create(req, res) {
  const product = await prisma.product.create({ data: req.body });
  return ok(res, { product }, 201);
}

module.exports = { list, create };
