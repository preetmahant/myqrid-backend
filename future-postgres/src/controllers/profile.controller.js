const { prisma } = require(
  "../config/prisma"
);

const {
  getProfileConfiguration
} = require(
  "../services/profileEngine.service"
);

const { ok } = require(
  "../utils/apiResponse"
);

async function getPublicProfile(req, res) {

  const tag =
    await prisma.tag.findFirstOrThrow({

      where: {
        uniqueSlug: req.params.slug,
        deletedAt: null
      },

      include: {
        owner: true
      }
    });

  const modules =
    await getProfileConfiguration(
      tag.tagType,
      tag.currentMode,
      tag.premiumEnabled
    );

  return ok(res, {
    tag,
    owner: tag.owner,
    modules
  });
}

module.exports = {
  getPublicProfile
};
