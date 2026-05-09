const { z } = require(
  "./common.schemas"
);

const trackScanSchema =
  z.object({

    body:
      z.object({

        tagId:
          z.coerce.bigint(),

        scannerUserId:
          z.coerce.bigint()
            .optional(),

        gpsLatitude:
          z.number()
            .optional(),

        gpsLongitude:
          z.number()
            .optional(),

        city:
          z.string()
            .optional(),

        region:
          z.string()
            .optional(),

        country:
          z.string()
            .optional(),

        browser:
          z.string()
            .optional(),

        os:
          z.string()
            .optional(),

        deviceType:
          z.string()
            .optional(),

        scanAction:
          z.enum([
            "scan",
            "click",
            "share",
            "save",
            "call",
            "whatsapp",
            "download",
            "nfc_tap",
            "ble_ping"
          ])

          .default("scan"),

        duration:
          z.number()
            .int()
            .optional(),

        referrer:
          z.string()
            .optional(),

        metadata:
          z.record(
            z.any()
          )

          .optional()
      })
  });

module.exports = {
  trackScanSchema
};
