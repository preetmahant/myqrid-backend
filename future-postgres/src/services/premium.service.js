const { prisma } = require(
  "../config/prisma"
);

async function getEnabledFeatures(
  userId
) {

  const user =
    await prisma.user.findUniqueOrThrow({

      where: {
        id: userId
      }
    });

  const features =
    await prisma.premiumFeature.findMany({

      where: {
        isActive: true
      }
    });

  const tierOrder = [
    "free",
    "premium",
    "pro",
    "enterprise"
  ];

  const currentTier =
    tierOrder.indexOf(
      user.premiumStatus
    );

  return features.filter(
    feature => {

      return (
        tierOrder.indexOf(
          feature.tier
        ) <= currentTier
      );
    }
  );
}

module.exports = {
  getEnabledFeatures
};
