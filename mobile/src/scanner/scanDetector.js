const upiPattern = /^upi:\/\//i;
const paymentLinkPattern = /(razorpay|paytm|phonepe|gpay|upi)/i;
const myqridPattern = /(myqrid\.in|myqrid-backend|\/u\/|\/t\/)/i;
const returnMePattern = /(returnme|lost|claim-reward|asset)/i;

export function detectScan(rawValue = "") {
  if (upiPattern.test(rawValue)) {
    return {
      type: "upi",
      title: "UPI payment QR",
      actions: ["Pay with GPay", "Pay with PhonePe", "Pay with Paytm", "Save payee"]
    };
  }

  if (myqridPattern.test(rawValue) && returnMePattern.test(rawValue)) {
    return {
      type: "returnme",
      title: "ReturnMe smart tag",
      actions: ["Return item", "Contact owner", "Claim reward", "Share location"]
    };
  }

  if (myqridPattern.test(rawValue)) {
    return {
      type: "myqrid",
      title: "myQRID identity",
      actions: ["View profile", "Connect", "Save contact", "Share"]
    };
  }

  if (paymentLinkPattern.test(rawValue)) {
    return {
      type: "payment_link",
      title: "Payment link",
      actions: ["Open payment", "Copy link", "Share"]
    };
  }

  return {
    type: "generic",
    title: "Generic QR",
    actions: ["Open", "Copy", "Share", "Create myQRID from this"]
  };
}
