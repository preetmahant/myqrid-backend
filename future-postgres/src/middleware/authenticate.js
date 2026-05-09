const jwt = require("jsonwebtoken");

const { env } = require(
  "../config/env"
);

const { prisma } = require(
  "../config/prisma"
);

const { fail } = require(
  "../utils/apiResponse"
);

async function authenticate(
  req,
  res,
  next
) {

  const header =
    req.get("authorization") || "";

  const token =
    header.startsWith("Bearer ")
      ? header.slice(7)
      : null;

  if (!token) {

    return fail(
      res,
      "Missing bearer token",
      401
    );
  }

  try {

    const payload =
      jwt.verify(
        token,
        env.JWT_ACCESS_SECRET
      );

    const user =
      await prisma.user.findFirst({

        where: {
          id: BigInt(payload.sub),
          deletedAt: null,
          isActive: true
        },

        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      });

    if (!user) {

      return fail(
        res,
        "User not found or inactive",
        401
      );
    }

    req.user = user;

    return next();

  } catch (error) {

    return fail(
      res,
      "Invalid or expired token",
      401
    );
  }
}

module.exports = {
  authenticate
};
