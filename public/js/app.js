const API_BASE = "https://myqrid-backend.myqrid.workers.dev";

const FALLBACK_USERNAME = "preetmahant";

let activeProfile = {};
let normalizedPhone = "";

const fallbackProducts = [
  {
    title: "Smart QR Identity Tag",
    text: "Premium tag for profile, pet, asset or safety use.",
    emoji: "🏷️",
    url: "/activate"
  },
  {
    title: "Digital Business Card",
    text: "Share WhatsApp, call, email, links and vCard in one scan.",
    emoji: "💼",
    url: "/manage"
  },
  {
    title: "Creator Link Hub",
    text: "Add offers, products, audience links and lead buttons.",
    emoji: "🚀",
    url: "/manage"
  }
];

function getUsername() {
  const cleanPath = window.location.pathname.replace(
    /^\/+|\/+$/g,
    ""
  );

  if (
    !cleanPath ||
    [
      "index.html",
      "profile",
      "shop",
      "insights",
      "scan",
      "more"
    ].includes(cleanPath)
  ) {
    return FALLBACK_USERNAME;
  }

  return cleanPath.split("/")[0];
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeIconClass(icon) {
  const cleanIcon = String(
    icon || "fas fa-link"
  ).trim();

  return /^[a-z0-9 _-]+$/i.test(cleanIcon)
    ? cleanIcon
    : "fas fa-link";
}

function safeUrl(url) {
  const cleanUrl = String(url || "").trim();

  if (!cleanUrl) return "#";

  if (cleanUrl.startsWith("/")) return cleanUrl;

  if (/^(https?:|mailto:|tel:)/i.test(cleanUrl)) {
    return cleanUrl;
  }

  if (/^(javascript:|data:|vbscript:)/i.test(cleanUrl)) {
    return "#";
  }

  return `https://${cleanUrl}`;
}

function normalizePhone(phone) {
  let digits = String(phone || "").replace(/\D/g, "");

  if (digits.length === 10) {
    digits = `91${digits}`;
  }

  return digits;
}

function showToast(message) {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  window.setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function trackClick(button) {
  const username =
    activeProfile.username || getUsername();

  if (!username || !button) return;

  fetch(
    `${API_BASE}/track-click?username=${encodeURIComponent(
      username
    )}&button=${encodeURIComponent(button)}`
  ).catch(() => {});
}

function renderProfile(data) {
  activeProfile = data || {};

  normalizedPhone = normalizePhone(
    activeProfile.whatsapp || activeProfile.phone
  );

  const displayName =
    activeProfile.display_name ||
    activeProfile.name ||
    "myQRID User";

  const bio =
    activeProfile.bio ||
    "Smart digital identity, contact hub and QR profile.";

  const username =
    activeProfile.username || getUsername();

  const slug =
    activeProfile.unique_slug ||
    activeProfile.master_slug ||
    "I-F12-01";

  const avatar =
    activeProfile.avatar ||
    activeProfile.photo ||
    "https://i.pravatar.cc/180?img=12";

  document.title = `${displayName} — myQRID`;

  document.getElementById("name").textContent =
    displayName;

  document.getElementById("bio").textContent =
    bio;

  document.getElementById("avatar").src =
    avatar;

  const topProfile =
    document.getElementById("topProfile");

  if (topProfile) {
    topProfile.innerHTML = "";

    const topProfileImage =
      document.createElement("img");

    topProfileImage.src = avatar;
    topProfileImage.alt = displayName;

    topProfile.appendChild(topProfileImage);
  }

  document.getElementById(
    "usernamePill"
  ).textContent = `@${username}`;

  document.getElementById(
    "slugPill"
  ).textContent = slug;

  document.getElementById(
    "identityBadge"
  ).textContent = getCategoryLabel(slug);

  const whatsappUrl = normalizedPhone
    ? `https://wa.me/${normalizedPhone}`
    : "#";

  const callUrl = normalizedPhone
    ? `tel:+${normalizedPhone}`
    : "#";

  const waicon =
    document.getElementById("waicon");

  if (waicon) waicon.href = whatsappUrl;

  const callAction =
    document.getElementById("callAction");

  if (callAction) callAction.href = callUrl;

  const emergencyCall =
    document.getElementById("emergencyCall");

  if (emergencyCall) emergencyCall.href = callUrl;

  setSocial("insta", activeProfile.instagram);
  setSocial(
    "twitter",
    activeProfile.twitter || activeProfile.x
  );
  setSocial("linkedin", activeProfile.linkedin);
  setSocial("youtube", activeProfile.youtube);
  setSocial(
    "websiteIcon",
    activeProfile.website
  );

  renderEmergency(activeProfile, normalizedPhone);
  renderLinks(activeProfile, normalizedPhone);

  renderProducts(
    activeProfile.products ||
      activeProfile.items ||
      fallbackProducts
  );

  renderInsights(activeProfile.analytics || {});
  renderQR();
}

function getCategoryLabel(slug) {
  const code = String(slug || "I")
    .charAt(0)
    .toUpperCase();

  const labels = {
    P: "PET IDENTITY",
    B: "BUSINESS IDENTITY",
    A: "ASSET IDENTITY",
    G: "GROUP IDENTITY",
    I: "DIGITAL IDENTITY",
    S: "SAFETY IDENTITY",
    U: "DIGITAL IDENTITY"
  };

  return labels[code] || "SMART IDENTITY";
}

function setSocial(id, url) {
  const el = document.getElementById(id);

  if (!el) return;

  el.href = safeUrl(url);
  el.style.opacity = url ? "1" : "0.38";
}

function renderEmergency(data, phone) {
  const status = String(
    data.status || data.tag_status || ""
  ).toLowerCase();

  const slugCode = String(
    data.unique_slug ||
      data.master_slug ||
      ""
  )
    .charAt(0)
    .toUpperCase();

  const shouldShow =
    ["lost", "emergency"].includes(status) ||
    slugCode === "S" ||
    data.blood_group ||
    data.medical_notes;

  const panel =
    document.getElementById("emergencyPanel");

  if (!panel) return;

  panel.classList.toggle("hidden", !shouldShow);

  if (!shouldShow) return;

  document.getElementById(
    "emergencyTitle"
  ).textContent =
    status === "lost"
      ? "Lost / return help needed"
      : "Emergency quick action";

  document.getElementById(
    "emergencyText"
  ).textContent =
    data.medical_notes ||
    data.reward ||
    data.blood_group ||
    "Use the priority contact button if help is needed.";

  if (!phone) {
    const btn =
      document.getElementById("emergencyCall");

    if (btn) {
      btn.style.display = "none";
    }
  }
}

function renderLinks(data, phone) {
  const links = [];

  if (phone) {
    links.push({
      title: "WhatsApp",
      subtitle: "Message instantly",
      icon: "fab fa-whatsapp",
      url: `https://wa.me/${phone}`,
      cls: "whatsapp",
      track: "whatsapp"
    });

    links.push({
      title: "Call",
      subtitle: "Tap to call",
      icon: "fas fa-phone",
      url: `tel:+${phone}`,
      track: "call"
    });
  }

  if (data.email) {
    links.push({
      title: "Email",
      subtitle: data.email,
      icon: "fas fa-envelope",
      url: `mailto:${data.email}`,
      track: "email"
    });
  }

  if (data.instagram) {
    links.push({
      title: "Instagram",
      subtitle: "Follow profile",
      icon: "fab fa-instagram",
      url: safeUrl(data.instagram),
      track: "instagram"
    });
  }

  if (data.linkedin) {
    links.push({
      title: "LinkedIn",
      subtitle: "Professional profile",
      icon: "fab fa-linkedin",
      url: safeUrl(data.linkedin),
      track: "linkedin"
    });
  }

  if (data.youtube) {
    links.push({
      title: "YouTube",
      subtitle: "Watch latest videos",
      icon: "fab fa-youtube",
      url: safeUrl(data.youtube),
      track: "youtube"
    });
  }

  if (data.website) {
    links.push({
      title: "Website",
      subtitle: "Visit official link",
      icon: "fas fa-globe",
      url: safeUrl(data.website),
      track: "website"
    });
  }

  if (Array.isArray(data.links)) {
    data.links.forEach((item, index) => {
      links.push({
        title:
          item.title ||
          `Custom Link ${index + 1}`,
        subtitle:
          item.subtitle || "Open link",
        icon:
          item.icon || "fas fa-link",
        url: safeUrl(item.url),
        track:
          item.title ||
          `custom_${index + 1}`
      });
    });
  }

  if (!links.length) {
    links.push(
      {
        title: "WhatsApp",
        subtitle: "Demo contact button",
        icon: "fab fa-whatsapp",
        url: "https://wa.me/919999999999",
        cls: "whatsapp",
        track: "whatsapp"
      },
      {
        title: "Create myQRID",
        subtitle:
          "Start your smart identity",
        icon:
          "fas fa-wand-magic-sparkles",
        url: "/manage",
        track: "create"
      }
    );
  }

  const linksEl =
    document.getElementById("links");

  if (!linksEl) return;

  linksEl.innerHTML = links
    .map(link => {
      const url = safeUrl(link.url);

      const sameWindow =
        url.startsWith("/") ||
        url.startsWith("tel:") ||
        url.startsWith("mailto:");

      return `
        <a
          class="smart-link ${escapeHtml(link.cls || "")}"
          href="${escapeHtml(url)}"
          target="${sameWindow ? "_self" : "_blank"}"
          rel="noreferrer"
          data-track="${escapeHtml(link.track)}"
        >
          <i class="${safeIconClass(link.icon)}"></i>

          <span>
            <strong>${escapeHtml(link.title)}</strong>
            <small>${escapeHtml(link.subtitle || "Open")}</small>
          </span>

          <span class="arrow">
            <i class="fas fa-chevron-right"></i>
          </span>
        </a>
      `;
    })
    .join("");

  document
    .querySelectorAll("[data-track]")
    .forEach(el => {
      el.addEventListener("click", () => {
        trackClick(el.dataset.track);
      });
    });
}

function renderProducts(products) {
  const normalized =
    Array.isArray(products) && products.length
      ? products
      : fallbackProducts;

  const container =
    document.getElementById("products");

  if (!container) return;

  container.innerHTML = normalized
    .slice(0, 6)
    .map((product, index) => {
      const productUrl = safeUrl(
        product.url ||
          product.link ||
          "/manage"
      );

      const productTarget =
        productUrl.startsWith("/")
          ? "_self"
          : "_blank";

      return `
        <article class="product-card">
          <div class="product-art">
            ${escapeHtml(
              product.emoji ||
                ["🏷️", "💼", "🛡️", "🐾"][index % 4]
            )}
          </div>

          <div>
            <h3>
              ${escapeHtml(
                product.title ||
                  product.name ||
                  "Premium myQRID product"
              )}
            </h3>

            <p>
              ${escapeHtml(
                product.text ||
                  product.description ||
                  "Add product details from your creator dashboard."
              )}
            </p>

            <a
              href="${escapeHtml(productUrl)}"
              target="${productTarget}"
              rel="noreferrer"
            >
              View offer →
            </a>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderInsights(analytics) {
  document.getElementById(
    "totalViews"
  ).textContent =
    analytics.total_views || 0;

  document.getElementById(
    "totalClicks"
  ).textContent =
    analytics.total_clicks || 0;

  document.getElementById(
    "onlineStatus"
  ).textContent =
    analytics.is_online === false
      ? "Idle"
      : "Live";

  const opens = Array.isArray(
    analytics.profile_opens
  )
    ? analytics.profile_opens.length
    : Number(analytics.total_views || 0);

  const bars = [
    28,
    46,
    35,
    64,
    50,
    82,
    Math.max(
      24,
      Math.min(100, opens * 12 || 74)
    )
  ];

  document.getElementById(
    "chartBars"
  ).innerHTML = bars
    .map(
      height =>
        `<span style="height:${Number(height)}%"></span>`
    )
    .join("");
}

function renderQR() {
  const qrImage =
    document.getElementById("qrImage");

  const qrCaption =
    document.getElementById("qrCaption");

  if (!qrImage || !qrCaption) return;

  const url =
    window.location.href.split("#")[0];

  qrImage.src =
    `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=14&data=${encodeURIComponent(url)}`;

  qrCaption.textContent = url;
}

function switchPage(page) {
  document.querySelectorAll(".page")
    .forEach(el => {
      el.classList.toggle(
        "active",
        el.id === `page-${page}`
      );
    });

  document.querySelectorAll(".tab")
    .forEach(el => {
      el.classList.toggle(
        "active",
        el.dataset.page === page
      );
    });

  window.location.hash =
    page === "profile" ? "" : page;
}

document.querySelectorAll(".tab")
  .forEach(tab => {
    tab.addEventListener("click", () => {
      switchPage(tab.dataset.page);
    });
  });

function openShare() {
  const popup =
    document.getElementById("popup");

  if (popup) {
    popup.classList.toggle("show");
  }
}

function copyLink() {
  navigator.clipboard
    ?.writeText(window.location.href)
    .then(() => {
      showToast("Link copied");
    });
}

function shareWhatsApp() {
  window.open(
    `https://wa.me/?text=${encodeURIComponent(window.location.href)}`,
    "_blank"
  );
}

function shareSMS() {
  window.location.href =
    `sms:?body=${encodeURIComponent(window.location.href)}`;
}

function downloadVCard() {
  const name =
    activeProfile.display_name ||
    document.getElementById("name")
      .textContent ||
    "myQRID User";

  const email =
    activeProfile.email || "";

  const phone = normalizedPhone
    ? `+${normalizedPhone}`
    : "";

  const vcf = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${name}`,
    phone ? `TEL:${phone}` : "",
    email ? `EMAIL:${email}` : "",
    `URL:${window.location.href}`,
    "END:VCARD"
  ]
    .filter(Boolean)
    .join("\n");

  const blob = new Blob(
    [vcf],
    { type: "text/vcard" }
  );

  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);

  a.download =
    `${name.replace(/\s+/g, "-").toLowerCase()}-myqrid.vcf`;

  a.click();

  URL.revokeObjectURL(a.href);
}

function generateQR() {
  window.open(
    `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=16&data=${encodeURIComponent(window.location.href.split("#")[0])}`,
    "_blank"
  );
}

function saveContact() {
  downloadVCard();
}

async function boot() {
  const username = getUsername();

  try {
    const response = await fetch(
      `${API_BASE}/api/profiles/${encodeURIComponent(username)}`
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    renderProfile(data);

  } catch (error) {

    console.error(error);

    renderProfile({
      username,
      display_name: "myQRID Premium",
      bio:
        "Smart digital identity, product hub, QR sharing and analytics in one premium profile.",
      unique_slug: "I-F12-01",
      phone: "9999999999",
      instagram:
        "https://instagram.com/",
      website:
        "https://myqrid.in",
      analytics: {
        total_views: 128,
        total_clicks: 42,
        is_online: true,
        profile_opens: [
          {},
          {},
          {},
          {},
          {},
          {}
        ]
      }
    });
  }

  const initial =
    window.location.hash.replace("#", "");

  if (
    ["shop", "scan", "insights", "more"]
      .includes(initial)
  ) {
    switchPage(initial);
  }
}

boot();

function getUsernameFromURL() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] || null;
}
