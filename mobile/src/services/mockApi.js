import { mockInsights, mockProducts, mockTags, mockUser } from "../mock/seedData";
import { detectScan } from "../scanner/scanDetector";

let generatedSerial = 1000;
let tags = [...mockTags];
let moduleVisibility = {
  landing: true,
  activation: true,
  shop: true,
  family: true,
  emergency: true,
  admin: true,
  reseller: false,
  enterprise: false
};

function wait(data, timeout = 180) {
  return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), timeout));
}

export const mockApi = {
  getBootstrap: () => wait({ user: mockUser, tags, insights: mockInsights, products: mockProducts, moduleVisibility }),
  scan: rawValue => wait({ rawValue, result: detectScan(rawValue) }),
  activateByClaimId: ({ claimId, tagType }) => {
    const tag = tags.find(item => item.claimId.toLowerCase() === String(claimId).toLowerCase());
    if (!tag) return wait({ ok: false, message: "Claim ID not found. Please check the card or contact admin." });
    tag.status = "active";
    tag.type = tagType || tag.type;
    tag.visible = true;
    return wait({ ok: true, message: "Tag activated successfully", tag });
  },
  generateAdminTags: ({ count = 10, type = "personal" }) => {
    const created = Array.from({ length: Math.min(count, 1000) }).map(() => {
      generatedSerial += 1;
      const claimId = `MQ-CLAIM-${generatedSerial}`;
      const tag = {
        id: `tag_${generatedSerial}`,
        slug: `mq-${generatedSerial}`,
        type,
        status: "inactive",
        scans: 0,
        claimId,
        visible: false
      };
      tags.push(tag);
      return tag;
    });
    return wait({ ok: true, created, total: tags.length });
  },
  setModuleVisibility: updates => {
    moduleVisibility = { ...moduleVisibility, ...updates };
    return wait({ ok: true, moduleVisibility });
  },
  designQr: config => wait({ ok: true, qrValue: config.value || `https://myqrid.in/u/${mockUser.username}`, config }),
  getTags: () => wait(tags)
};
