export const tagTypeConfig = {
  personal: {
    title: "Digital Identity",
    engine: "digitalIdentity",
    modules: ["bio", "links", "whatsapp", "vcard", "payments", "shop", "analytics"],
    fields: ["displayName", "bio", "phone", "whatsapp", "email", "links"],
    ctas: ["Call", "WhatsApp", "Save Contact", "Share QR"]
  },
  pet: {
    title: "Pet Safety",
    engine: "pet",
    modules: ["petInfo", "ownerContact", "vaccination", "reward", "finderChat", "locationHistory"],
    fields: ["petName", "breed", "age", "allergies", "vetInfo", "rewardAmount"],
    ctas: ["Call Owner", "WhatsApp Owner", "Claim Reward", "Share Location"]
  },
  vehicle: {
    title: "Vehicle Identity",
    engine: "vehicle",
    modules: ["vehicleDocs", "insurance", "fastag", "roadsideHelp", "maintenanceLogs"],
    fields: ["vehicleNumber", "rc", "insurance", "fastag", "puc", "emergencyContact"],
    ctas: ["Call Owner", "Roadside Help", "Insurance", "FASTag"]
  },
  medical: {
    title: "HelpMe Medical",
    engine: "helpMe",
    modules: ["sos", "bloodGroup", "allergies", "medicines", "emergencyContacts", "liveLocation"],
    fields: ["bloodGroup", "allergies", "conditions", "medicines", "emergencyContacts"],
    ctas: ["SOS", "Call Family", "Medical Profile", "Share Location"],
    danger: true
  },
  asset: {
    title: "ReturnMe Asset",
    engine: "returnMe",
    modules: ["assetId", "ownershipProof", "warranty", "returnInstructions", "reward", "scanHeatmap"],
    fields: ["assetName", "serialNumber", "company", "department", "warranty", "rewardAmount"],
    ctas: ["Return Item", "Contact Owner", "Claim Reward", "Transfer Ownership"]
  },
  business: {
    title: "Business Card",
    engine: "business",
    modules: ["company", "leadCapture", "appointments", "catalog", "reviews", "analytics"],
    fields: ["company", "role", "gst", "website", "leadForm", "products"],
    ctas: ["Enquire", "Book Meeting", "Save Contact", "View Products"]
  }
};
