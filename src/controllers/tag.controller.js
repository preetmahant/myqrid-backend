const { prisma } = require("../config/prisma");
const tagService = require("../services/tag.service");
const { ok } = require("../utils/apiResponse");

async function list(req, res) {
  const tags = await prisma.tag.findMany({ where: { deletedAt: null }, take: 50, orderBy: { createdAt: "desc" } });
  return ok(res, { tags });
}

async function create(req, res) {
  const tag = await tagService.createTag(req.validated.body);
  return ok(res, { tag }, 201);
}

async function getBySlug(req, res) {
  const tag = await prisma.tag.findFirstOrThrow({ where: { uniqueSlug: req.params.slug, deletedAt: null } });
  return ok(res, { tag });
}

async function updateMode(req, res) {
  const tag = await prisma.tag.update({ where: { id: BigInt(req.params.id) }, data: { currentMode: req.body.currentMode } });
  return ok(res, { tag });
}

module.exports = { list, create, getBySlug, updateMode };
