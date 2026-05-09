const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { prisma } = require("../config/prisma");
const { env } = require("../config/env");

function signAccessToken(user) {
  return jwt.sign({ sub: user.id.toString(), role: user.role.roleName }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN
  });
}

function signRefreshToken(user) {
  return jwt.sign({ sub: user.id.toString(), tokenType: "refresh" }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN
  });
}

async function register(data) {
  const tenant = await prisma.tenant.upsert({
    where: { slug: data.tenantSlug || "default" },
    create: { name: data.tenantName || "myQRID", slug: data.tenantSlug || "default" },
    update: {}
  });
  const role = await prisma.role.findUniqueOrThrow({ where: { roleName: "user" } });
  const passwordHash = data.password ? await bcrypt.hash(data.password, env.BCRYPT_ROUNDS) : null;

  return prisma.user.create({
    data: {
      tenantId: tenant.id,
      username: data.username,
      email: data.email,
      phone: data.phone,
      passwordHash,
      roleId: role.id,
      referralCode: crypto.randomBytes(4).toString("hex").toUpperCase()
    },
    include: { role: true }
  });
}

async function login({ email, phone, password, deviceName, ipAddress, userAgent }) {
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: email || undefined }, { phone: phone || undefined }], deletedAt: null, isActive: true },
    include: { role: true }
  });

  if (!user || !user.passwordHash || !password) {
    throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
  await prisma.userSession.create({
    data: {
      userId: user.id,
      refreshToken,
      deviceName,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });

  return { user, accessToken, refreshToken };
}

module.exports = { register, login, signAccessToken, signRefreshToken };
