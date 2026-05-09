function getSocialLinks(profile) {

  return [

    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: "📱",

      href: profile.whatsapp
        ? `https://wa.me/${String(profile.whatsapp).replace(/\D/g, "")}`
        : null,

      gradient:
        "linear-gradient(135deg, rgba(124,58,237,0.82), rgba(91,33,182,0.74))",

      visible: !!profile.whatsapp
    },

    {
      id: "call",
      label: "Call",
      icon: "📞",

      href: profile.phone
        ? `tel:${profile.phone}`
        : null,

      gradient:
        "linear-gradient(135deg, rgba(139,92,246,0.82), rgba(109,40,217,0.74))",

      visible: !!profile.phone
    },

    {
      id: "email",
      label: "Email",
      icon: "✉️",

      href: profile.email
        ? `mailto:${profile.email}`
        : null,

      gradient:
        "linear-gradient(135deg, rgba(147,51,234,0.82), rgba(88,28,135,0.72))",

      visible: !!profile.email
    },

    {
      id: "website",
      label: "Website",
      icon: "🌐",

      href: profile.website || null,

      gradient:
        "linear-gradient(135deg, rgba(126,34,206,0.82), rgba(76,29,149,0.72))",

      visible: !!profile.website
    },

    {
      id: "instagram",
      label: "Instagram",
      icon: "📸",

      href: profile.instagram || null,

      gradient:
        "linear-gradient(135deg, rgba(168,85,247,0.82), rgba(107,33,168,0.74))",

      visible: !!profile.instagram
    },

    {
      id: "youtube",
      label: "YouTube",
      icon: "▶️",

      href: profile.youtube || null,

      gradient:
        "linear-gradient(135deg, rgba(139,92,246,0.82), rgba(91,33,182,0.74))",

      visible: !!profile.youtube
    },

    {
      id: "linkedin",
      label: "LinkedIn",
      icon: "💼",

      href: profile.linkedin || null,

      gradient:
        "linear-gradient(135deg, rgba(139,92,246,0.82), rgba(67,56,202,0.72))",

      visible: !!profile.linkedin
    },

    {
      id: "telegram",
      label: "Telegram",
      icon: "✈️",

      href: profile.telegram || null,

      gradient:
        "linear-gradient(135deg, rgba(124,58,237,0.82), rgba(76,29,149,0.72))",

      visible: !!profile.telegram
    },

    {
      id: "twitter",
      label: "X / Twitter",
      icon: "𝕏",

      href: profile.twitter || null,

      gradient:
        "linear-gradient(135deg, rgba(91,33,182,0.82), rgba(67,56,202,0.72))",

      visible: !!profile.twitter
    },

    {
      id: "snapchat",
      label: "Snapchat",
      icon: "👻",

      href: profile.snapchat || null,

      gradient:
        "linear-gradient(135deg, rgba(168,85,247,0.82), rgba(126,34,206,0.72))",

      visible: !!profile.snapchat
    }

  ];
}

function renderSocialLinks(
  profile,
  container
) {

  const links =
    getSocialLinks(profile)
      .filter(link => link.visible);

  if (!links.length) {

    container.innerHTML = `
      <div class="social-empty">
        No social links added yet.
      </div>
    `;

    return;
  }

  container.innerHTML =
    links.map(link => `
      <a
        class="social-card"
        href="${link.href}"
        target="_blank"
        rel="noreferrer"
        style="background:${link.gradient}"
      >

        <div class="social-glow"></div>

        <span class="social-icon">
          ${link.icon}
        </span>

        <span class="social-label">
          ${link.label}
        </span>

        <span class="social-arrow">
          →
        </span>

      </a>
    `).join("");
}
