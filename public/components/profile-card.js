(function () {

  var SOCIAL_SVGS = {
    whatsapp:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.4-2.3-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4C8 8 7.2 8.8 7.2 10.4s1.1 3.1 1.2 3.3c.1.2 2.1 3.2 5 4.5.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.6.2-1.2.1-1.3-.1-.1-.3-.2-.6-.3z"/><path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.7 1.4 5.3L2 22l4.8-1.4C8.3 21.5 10.1 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.5c-1.7 0-3.4-.5-4.8-1.3l-.3-.2-3.2.9.9-3.1-.2-.3C3.5 15.3 3 13.7 3 12 3 7 7 3 12 3s9 4 9 9-4 9-9 9z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
    youtube:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2s-.2-1.6-1-2.3c-.9-1-1.9-1-2.4-1C17.1 2.7 12 2.7 12 2.7s-5.1 0-8.1.2c-.5.1-1.5.1-2.4 1-.7.7-1 2.3-1 2.3S.3 8 .3 9.8v1.7c0 1.8.2 3.6.2 3.6s.2 1.6 1 2.3c.9 1 2.1.9 2.6 1C5.8 18.6 12 18.6 12 18.6s5.1 0 8.1-.2c.5-.1 1.5-.1 2.4-1 .7-.7 1-2.3 1-2.3s.2-1.8.2-3.6V9.8c0-1.8-.2-3.6-.2-3.6zM9.7 13.5V7.8l6.5 2.9-6.5 2.8z"/></svg>',
    linkedin:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.4 20.4h-3.4v-5.3c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8v5.4H9.8V9h3.2v1.6h.1c.5-.9 1.6-1.8 3.2-1.8 3.4 0 4.1 2.2 4.1 5.1v6.5zM5.3 7.4a2 2 0 110-4 2 2 0 010 4zm1.7 13H3.6V9h3.4v11.4zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.5C0 23.2.8 24 1.8 24h20.4c1 0 1.8-.8 1.8-1.8V1.7C24 .8 23.2 0 22.2 0z"/></svg>',
    twitter:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    telegram:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.9 8.2l-2 9.4c-.1.6-.5.8-1 .5l-2.8-2.1-1.3 1.3c-.2.2-.3.3-.6.3l.2-2.9 5.1-4.6c.2-.2 0-.3-.3-.1L6.2 14.3 3.4 13.4c-.6-.2-.6-.6.1-.9l11.6-4.5c.6-.2 1.1.2.8.9v.3z"/></svg>',
    snapchat:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.065.001c1.496-.007 4.016.432 5.847 2.986.68.944.807 2.494.866 3.76l.023.527c.045.073.179.147.405.19.302.057.656.039.987-.05.179-.049.48-.049.727.065.383.176.612.51.607.892-.006.43-.32.79-.87.989-.113.04-.25.079-.399.12-.532.142-1.335.357-1.549.959a1 1 0 00-.052.377c.023.432.29.815.547 1.143C19.863 13.1 21 14.985 21 16.638c0 1.81-1.41 3.362-3.862 4.5-.447.21-.78.597-.83 1.07-.024.23-.063.38-.094.48-.112.364-.407.563-.742.563-.178 0-.365-.046-.563-.093l-.065-.016c-.695-.169-1.408-.255-2.122-.255-.697 0-1.396.083-2.077.247-.264.064-.458.104-.613.104-.374 0-.655-.228-.768-.624-.03-.098-.066-.24-.089-.46-.053-.48-.39-.873-.843-1.084C6.39 19.996 5 18.437 5 16.638c0-1.653 1.137-3.537 2.376-5.059.258-.328.524-.71.547-1.143a1 1 0 00-.052-.377c-.214-.602-1.017-.817-1.549-.96-.149-.04-.286-.079-.399-.119-.55-.198-.864-.559-.87-.988-.005-.383.224-.716.607-.892.247-.114.548-.114.727-.066.331.09.685.108.988.051.225-.042.36-.117.404-.19l.023-.527c.059-1.266.186-2.816.866-3.76C8.05.434 10.57-.006 12.065.001z"/></svg>',
    globe:     '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
    envelope:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
    phone:     '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>'
  };

  function escHtml(v) {
    return String(v || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function safeHref(url) {
    var s = String(url || "").trim();
    if (!s) return null;
    if (/^(https?:|mailto:|tel:|\/)/i.test(s)) return s;
    if (/^(javascript:|data:|vbscript:)/i.test(s)) return null;
    return "https://" + s;
  }

  function normalizePhone(p) {
    var d = String(p || "").replace(/\D/g, "");
    if (d.length === 10) d = "91" + d;
    return d;
  }

  function buildSocialLinks(profile) {
    var phone = normalizePhone(profile.whatsapp || profile.phone);
    var links = [];
    if (phone)             links.push({ key: "whatsapp",  label: "WhatsApp",    href: "https://wa.me/" + phone });
    if (phone)             links.push({ key: "phone",     label: "Call",        href: "tel:+" + phone });
    if (profile.email)     links.push({ key: "envelope",  label: "Email",       href: "mailto:" + profile.email });
    if (profile.instagram) links.push({ key: "instagram", label: "Instagram",   href: safeHref(profile.instagram) });
    if (profile.youtube)   links.push({ key: "youtube",   label: "YouTube",     href: safeHref(profile.youtube) });
    if (profile.linkedin)  links.push({ key: "linkedin",  label: "LinkedIn",    href: safeHref(profile.linkedin) });
    if (profile.twitter)   links.push({ key: "twitter",   label: "X / Twitter", href: safeHref(profile.twitter) });
    if (profile.telegram)  links.push({ key: "telegram",  label: "Telegram",    href: safeHref(profile.telegram) });
    if (profile.snapchat)  links.push({ key: "snapchat",  label: "Snapchat",    href: safeHref(profile.snapchat) });
    if (profile.website)   links.push({ key: "globe",     label: "Website",     href: safeHref(profile.website) });
    return links.filter(function (l) { return !!l.href; });
  }

  function buildVcf(profile, phone) {
    var name  = profile.display_name || profile.name || "myQRID User";
    var lines = ["BEGIN:VCARD", "VERSION:3.0", "FN:" + name];
    if (phone)         lines.push("TEL:+" + phone);
    if (profile.email) lines.push("EMAIL:" + profile.email);
    lines.push("URL:" + window.location.href, "END:VCARD");
    return lines.join("\r\n");
  }

  function getCategoryLabel(slug) {
    var labels = {
      P: "PET IDENTITY", B: "BUSINESS IDENTITY", A: "ASSET IDENTITY",
      G: "GROUP IDENTITY", I: "DIGITAL IDENTITY", S: "SAFETY IDENTITY"
    };
    return labels[String(slug || "I").charAt(0).toUpperCase()] || "SMART IDENTITY";
  }

  function renderProfileCard(profile, container) {
    if (!container) return;

    var phone      = normalizePhone(profile.whatsapp || profile.phone);
    var name       = escHtml(profile.display_name || profile.name || "myQRID User");
    var bio        = escHtml(profile.bio || "Smart digital identity.");
    var location   = escHtml(profile.location || "");
    var avatar     = escHtml(profile.avatar || profile.photo || "https://i.pravatar.cc/180?img=12");
    var username   = escHtml(profile.username || "");
    var slug       = escHtml(profile.unique_slug || profile.master_slug || "I-000001");
    var profileUrl = window.location.href.split("#")[0];
    var qrSrc      = "/api/qr?data=" + encodeURIComponent(profileUrl);
    var waHref     = phone ? "https://wa.me/" + phone : null;
    var callHref   = phone ? "tel:+" + phone : null;
    var mailHref   = profile.email ? "mailto:" + escHtml(profile.email) : null;
    var socialLinks = buildSocialLinks(profile);

    var socialHtml = socialLinks.length
      ? socialLinks.map(function (l) {
          return '<a class="pc-social-link" href="' + escHtml(l.href) + '" target="_blank" rel="noreferrer">' +
            '<span class="pc-social-icon">' + (SOCIAL_SVGS[l.key] || SOCIAL_SVGS.globe) + '</span>' +
            '<span class="pc-social-label">' + escHtml(l.label) + '</span>' +
            '<span class="pc-social-arrow">&#8594;</span>' +
            '</a>';
        }).join("")
      : '<p class="pc-no-links">No links added yet.</p>';

    container.innerHTML =
      '<div class="pc-card">' +
        '<div class="pc-avatar-wrap">' +
          '<img class="pc-avatar" src="' + avatar + '" alt="' + name + '">' +
        '</div>' +
        '<div class="pc-badge">' + escHtml(getCategoryLabel(slug)) + '</div>' +
        '<h1 class="pc-name">' + name + '</h1>' +
        (location ? '<p class="pc-location">&#128205; ' + location + '</p>' : '') +
        '<p class="pc-bio">' + bio + '</p>' +
        '<div class="pc-slugs">' +
          (username ? '<span>@' + username + '</span>' : '') +
          '<span>' + slug + '</span>' +
        '</div>' +
        '<div class="pc-cta-row">' +
          (waHref   ? '<a class="pc-cta pc-cta--wa"   href="' + waHref   + '" target="_blank" rel="noreferrer">' + SOCIAL_SVGS.whatsapp + '<span>WhatsApp</span></a>' : '') +
          (callHref ? '<a class="pc-cta pc-cta--call" href="' + callHref + '">' + SOCIAL_SVGS.phone + '<span>Call</span></a>' : '') +
          (mailHref ? '<a class="pc-cta pc-cta--mail" href="' + mailHref + '">' + SOCIAL_SVGS.envelope + '<span>Email</span></a>' : '') +
        '</div>' +
        '<div class="pc-action-row">' +
          '<button class="pc-action-btn" id="pc-vcf-btn">' + SOCIAL_SVGS.phone + '<span>Save Contact</span></button>' +
          '<button class="pc-action-btn" id="pc-copy-btn">' + SOCIAL_SVGS.globe + '<span>Copy Link</span></button>' +
        '</div>' +
        '<div class="pc-social-section">' +
          '<p class="pc-section-label">Connect</p>' +
          socialHtml +
        '</div>' +
        '<div class="pc-qr-section">' +
          '<p class="pc-section-label">QR Code</p>' +
          '<div class="pc-qr-frame"><img src="' + qrSrc + '" alt="QR code" loading="lazy"></div>' +
        '</div>' +
      '</div>';

    container.querySelector("#pc-vcf-btn").addEventListener("click", function () {
      var vcf  = buildVcf(profile, phone);
      var blob = new Blob([vcf], { type: "text/vcard" });
      var a    = document.createElement("a");
      a.href   = URL.createObjectURL(blob);
      a.download = (profile.name || "contact").replace(/\s+/g, "-").toLowerCase() + ".vcf";
      a.click();
      URL.revokeObjectURL(a.href);
    });

    container.querySelector("#pc-copy-btn").addEventListener("click", function () {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(function () {
          showToast("Link copied!");
        });
      } else {
        showToast("Copy: " + window.location.href);
      }
    });
  }

  window.renderProfileCard = renderProfileCard;
}());
