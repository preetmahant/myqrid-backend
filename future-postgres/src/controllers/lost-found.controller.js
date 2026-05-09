const { prisma } = require(
  "../config/prisma"
);

const { ok } = require(
  "../utils/apiResponse"
);

async function report(req, res) {

  const record =
    await prisma.lostAndFound.create({
      data: req.body
    });

  return ok(
    res,
    {
      lostAndFound: record
    },
    201
  );
}

module.exports = {
  report
};
