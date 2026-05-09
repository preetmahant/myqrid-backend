const { prisma } = require("../config/prisma");

function suspiciousScore({ scannerIp, previousScans }) {
  let score = 0;
  if (!scannerIp) score += 10;
  if (previousScans > 10) score += 40;
  if (previousScans > 50) score += 40;
  return Math.min(score, 100);
}

async function trackScan({ tagId, scannerUserId, scannerIp, gpsLatitude, gpsLongitude, city, region, country, browser, os, deviceType, scanAction, duration, referrer, metadata }) {
  const recent = await prisma.scanLog.count({
    where: {
      tagId,
      scannerIp,
      timestamp: { gte: new Date(Date.now() - 10 * 60 * 1000) }
    }
  });
  const score = suspiciousScore({ scannerIp, previousScans: recent });

  const log = await prisma.scanLog.create({
    data: {
      tagId,
      scannerUserId,
      scannerIp,
      gpsLatitude,
      gpsLongitude,
      city,
      region,
      country,
      browser,
      os,
      deviceType,
      scanAction,
      duration,
      referrer,
      suspiciousScore: score,
      anomalyFlags: score >= 70 ? ["repeated_scan"] : [],
      metadata: metadata || {}
    }
  });

  await prisma.tag.update({ where: { id: tagId }, data: { scanCount: { increment: 1 }, lastScanAt: new Date() } });
  return log;
}

module.exports = { trackScan, suspiciousScore };
