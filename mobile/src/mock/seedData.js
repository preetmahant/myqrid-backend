export const mockUser = {
  id: "u_1001",
  name: "Preet Mahant",
  username: "preetmahant",
  premiumStatus: "premium",
  phone: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  city: "Ahmedabad",
  profileCompletion: 82
};

export const mockTags = [
  { id: "tag_1", slug: "pet-luna", type: "pet", status: "active", scans: 128, claimId: "MQ-CLAIM-PET-8821", visible: true },
  { id: "tag_2", slug: "asset-laptop", type: "asset", status: "lost", scans: 42, claimId: "MQ-CLAIM-AST-6612", visible: true },
  { id: "tag_3", slug: "vehicle-gj01", type: "vehicle", status: "inactive", scans: 0, claimId: "MQ-CLAIM-VEH-9021", visible: false }
];

export const mockInsights = {
  totalScans: 12480,
  todayScans: 218,
  ctaClicks: 841,
  countries: 12,
  suspiciousScans: 3,
  peakHour: "8 PM",
  topCity: "Mumbai",
  conversionRate: "14.8%"
};

export const mockProducts = [
  { id: "p1", title: "NFC Smart Card", price: "₹499", category: "NFC", badge: "Best seller" },
  { id: "p2", title: "Helmet Safety QR", price: "₹199", category: "Helmet", badge: "Safety" },
  { id: "p3", title: "ReturnMe Asset Pack", price: "₹299", category: "Asset", badge: "Recovery" }
];
