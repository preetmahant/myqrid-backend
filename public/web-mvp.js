const state = {
  profile: null,
  adminPassword: sessionStorage.getItem("myqrid_admin_password") || "",
  adminProfiles: [],
  recentActivity: [],
  editAdminPassword: ""
};
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

const SOCIAL_TYPES = {
  whatsapp: { label: "WhatsApp", icon: "💬", prefix: "https://wa.me/", action: "whatsapp_click" },
  instagram: { label: "Instagram", icon: "◎", prefix: "https://instagram.com/", action: "social_click" },
  x: { label: "X / Twitter", icon: "𝕏", prefix: "https://x.com/", action: "social_click" },
  youtube: { label: "YouTube", icon: "▶", prefix: "https://youtube.com/", action: "social_click" },
  linkedin: { label: "LinkedIn", icon: "in", prefix: "https://linkedin.com/in/", action: "social_click" },
  telegram: { label: "Telegram", icon: "✈", prefix: "https://t.me/", action: "social_click" },
  snapchat: { label: "Snapchat", icon: "◌", prefix: "https://snapchat.com/add/", action: "social_click" },
  email: { label: "Email", icon: "✉", prefix: "mailto:", action: "email_click" },
  website: { label: "Website", icon: "↗", prefix: "https://", action: "website_click" },
  call: { label: "Call", icon: "☎", prefix: "tel:", action: "call_click" },
  custom: { label: "Custom", icon: "★", prefix: "https://", action: "social_click" }
};

const DEFAULT_LINKS = [
  { type: "whatsapp", label: "WhatsApp", value: "", enabled: true },
  { type: "instagram", label: "Instagram", value: "", enabled: true },
  { type: "website", label: "Website", value: "", enabled: true },
  { type: "email", label: "Email", value: "", enabled: true }
];

function routeInfo() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  return { section: parts[0] || "create", value: decodeURIComponent(parts[1] || "") };
}

function showOnly(id) {
  ["createView", "publicView", "adminView"].forEach(viewId => {
    const el = $("#" + viewId);
    if (el) el.hidden = viewId !== id;
  });
}

function setBanner(message, type = "info") {
  const banner = $("#statusBanner");
  if (!banner) return;
  banner.hidden = !message;
  banner.textContent = message || "";
  banner.dataset.type = type;
}

function toast(message) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2400);
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function initialsAvatar(name) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || "myQRID")}`;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text || "Unexpected response" }; }
  if (!response.ok) throw new Error(data.error || `Request failed with ${response.status}`);
  return data;
}

function formPayload(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function vcard(profile) {
  const phone = profile.phone || "";
  const whatsapp = profile.whatsapp || phone;
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${profile.name || profile.username}`,
    phone ? `TEL;TYPE=CELL:${phone}` : "",
    profile.email ? `EMAIL:${profile.email}` : "",
    profile.profile_url ? `URL:${profile.profile_url}` : "",
    whatsapp ? `NOTE:WhatsApp ${whatsapp} | myQRID ${profile.profile_url || ""}` : "",
    "END:VCARD"
  ].filter(Boolean).join("\n");
}

function downloadVcf(profile) {
  const blob = new Blob([vcard(profile)], { type: "text/vcard;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${profile.username || "myqrid"}.vcf`;
  a.click();
  URL.revokeObjectURL(a.href);
  track("save_contact", profile.username);
}

async function copyText(text, label = "Copied") {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const input = document.createElement("textarea");
      input.value = text;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    toast(label);
  } catch {
    toast("Copy failed. Long-press the link to copy.");
  }
}

function whatsappUrl(profile) {
  const digits = String(profile.whatsapp || profile.phone || "").replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent("Hi, I found your myQRID profile: " + profile.profile_url)}`;
}

function normalizeSocialHref(type, value, profile = {}) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (type === "whatsapp") return raw.startsWith("http") ? raw : `https://wa.me/${raw.replace(/\D/g, "")}`;
  if (type === "call") return raw.startsWith("tel:") ? raw : `tel:${raw}`;
  if (type === "email") return raw.startsWith("mailto:") ? raw : `mailto:${raw}`;
  if (/^https?:\/\//i.test(raw)) return raw;
  const cleanHandle = raw.replace(/^@/, "").replace(/^\/+/, "");
  const prefix = SOCIAL_TYPES[type]?.prefix || "https://";
  return prefix + cleanHandle;
}

function profileLinks(profile) {
  const stored = Array.isArray(profile.links) ? profile.links : [];
  const generated = [
    profile.whatsapp ? { type: "whatsapp", label: "WhatsApp", value: profile.whatsapp, enabled: true } : null,
    profile.email ? { type: "email", label: "Email", value: profile.email, enabled: true } : null,
    profile.website ? { type: "website", label: "Website", value: profile.website, enabled: true } : null,
    profile.phone ? { type: "call", label: "Call", value: profile.phone, enabled: true } : null
  ].filter(Boolean);
  const links = stored.length ? stored : generated;
  return links.filter(link => link && link.enabled !== false && link.value);
}

function renderSocialLinks(profile, mount, compact = false) {
  if (!mount) return;
  const links = profileLinks(profile);
  if (!links.length) {
    mount.innerHTML = `<div class="social-empty">No social links yet.</div>`;
    return;
  }
  mount.innerHTML = links.map(link => {
    const type = SOCIAL_TYPES[link.type] ? link.type : "custom";
    const href = normalizeSocialHref(type, link.value, profile);
    const cfg = SOCIAL_TYPES[type];
    return `<a class="social-card social-${escapeHtml(type)}${compact ? " is-compact" : ""}" href="${escapeHtml(href)}" target="${type === "call" || type === "email" ? "_self" : "_blank"}" rel="noreferrer" data-social-action="${escapeHtml(cfg.action)}" data-social-type="${escapeHtml(type)}">
      <span class="social-glow"></span>
      <span class="social-icon" aria-hidden="true">${escapeHtml(cfg.icon)}</span>
      <span class="social-label">${escapeHtml(link.label || cfg.label)}</span>
      <span class="social-arrow" aria-hidden="true">›</span>
    </a>`;
  }).join("");
  mount.querySelectorAll("[data-social-action]").forEach(el => el.addEventListener("click", () => track(el.dataset.socialAction, profile.username, { type: el.dataset.socialType })));
}

async function shareProfile(profile) {
  track("share_profile", profile.username);
  const shareData = { title: `${profile.name} on myQRID`, text: profile.bio || "Connect with me on myQRID", url: profile.profile_url };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {
      if (err.name === "AbortError") return;
    }
  }
  copyText(profile.profile_url, "Profile link copied");
}

function qrDownloadUrl(profile, tag = false) {
  const data = tag ? profile.tag_url : profile.profile_url;
  return `/api/qr?data=${encodeURIComponent(data)}&download=1`;
}

function downloadQr(profile, tag = false) {
  const a = document.createElement("a");
  a.href = qrDownloadUrl(profile, tag);
  a.download = `${profile.username}-${tag ? "tag" : "profile"}-qr.png`;
  a.click();
}

function printQrSheet(profile) {
  const html = `<!doctype html><title>Print myQRID</title><style>body{font-family:Arial,sans-serif;text-align:center;padding:30px} .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.card{border:2px solid #111;border-radius:18px;padding:20px}img{width:260px;max-width:100%}small{display:block;margin-top:8px}@media print{button{display:none}}</style><button onclick="print()">Print</button><h1>${escapeHtml(profile.name)} myQRID</h1><p>@${escapeHtml(profile.username)}</p><div class="grid"><div class="card"><img src="${escapeHtml(profile.qr_url)}"><small>Profile: ${escapeHtml(profile.profile_url)}</small></div><div class="card"><img src="${escapeHtml(profile.tag_qr_url)}"><small>Recovery tag: ${escapeHtml(profile.tag_url)}</small></div></div>`;
  const win = window.open("", "_blank", "noopener,noreferrer");
  win.document.write(html);
  win.document.close();
}

function renderActionButtons(profile, mount) {
  mount.innerHTML = `
    <a class="mvp-primary" href="tel:${escapeHtml(profile.phone)}" data-action="call_click">Call</a>
    <a class="mvp-secondary whatsapp-cta" href="${escapeHtml(whatsappUrl(profile))}" target="_blank" rel="noreferrer" data-action="whatsapp_click">WhatsApp</a>
    <button class="mvp-secondary" id="shareProfile" type="button">Share profile</button>
    <button class="mvp-secondary" id="saveVcf" type="button">Download VCF</button>
    <button class="mvp-secondary" id="copyLink" type="button">Copy link</button>
  `;
  mount.querySelectorAll("[data-action]").forEach(el => el.addEventListener("click", () => track(el.dataset.action, profile.username)));
  mount.querySelector("#shareProfile")?.addEventListener("click", () => shareProfile(profile));
  mount.querySelector("#saveVcf")?.addEventListener("click", () => downloadVcf(profile));
  mount.querySelector("#copyLink")?.addEventListener("click", () => {
    track("copy_link", profile.username);
    copyText(profile.profile_url, "Profile link copied");
  });
}

async function track(action, username, metadata = {}) {
  if (!username) return;
  try {
    await requestJson("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, action, metadata })
    });
  } catch {
    // Tracking should never block contact actions.
  }
}

async function loadStatus() {
  try {
    const status = await requestJson("/api/status");
    if (!status.firebase_configured) {
      setBanner("Firebase is not configured. Local temporary memory fallback is active; add Firebase env vars on Render for production persistence.", "warn");
    } else {
      setBanner("Firebase connected. Profiles are saved permanently.", "ok");
    }
  } catch (err) {
    setBanner(err.message, "error");
  }
}

function saveLocalEditToken(profile) {
  if (profile?.username && profile?.edit_token) localStorage.setItem(`myqrid_edit_${profile.username}`, profile.edit_token);
}

function fillResult(profile) {
  state.profile = profile;
  saveLocalEditToken(profile);
  $("#resultCard").hidden = false;
  $("#resultAvatar").src = profile.image_url || initialsAvatar(profile.name);
  $("#resultName").textContent = profile.name;
  $("#resultUsername").textContent = `@${profile.username}`;
  $("#resultProfileUrl").textContent = profile.profile_url;
  $("#resultProfileUrl").href = profile.profile_url;
  $("#resultTagUrl").textContent = profile.tag_url;
  $("#resultTagUrl").href = profile.tag_url;
  $("#resultProfileQr").src = profile.qr_url;
  $("#resultTagQr").src = profile.tag_qr_url;
  renderSocialLinks(profile, $("#resultSocialLinks"), true);
  $("#copyProfileLink").onclick = () => copyText(profile.profile_url, "Profile link copied");
  $("#downloadResultVcf").onclick = () => downloadVcf(profile);
  $("#downloadProfileQr").onclick = () => downloadQr(profile, false);
  $("#downloadTagQr").onclick = () => downloadQr(profile, true);
  $("#printQr").onclick = () => printQrSheet(profile);
  $("#editProfile").onclick = () => loadProfileIntoForm(profile);
}

function loadProfileIntoForm(profile) {
  const form = $("#profileForm");
  ["name", "phone", "whatsapp", "email", "website", "theme", "bio", "image_url", "emergency_name", "emergency_phone", "edit_token"].forEach(key => {
    if (form.elements[key]) form.elements[key].value = profile[key] || "";
  });
  setLinkRows(Array.isArray(profile.links) && profile.links.length ? profile.links : linksFromProfileFields(profile));
  form.dataset.username = profile.username;
  $("#profileSubmit").textContent = "Update profile";
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function createProfile(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button[type='submit']");
  const editingUsername = form.dataset.username;
  button.disabled = true;
  button.textContent = editingUsername ? "Updating…" : "Saving…";
  setBanner(editingUsername ? "Updating profile…" : "Saving profile…", "info");
  try {
    syncLinksJson();
    const payload = formPayload(form);
    const data = await requestJson(editingUsername ? `/api/profiles/${encodeURIComponent(editingUsername)}` : "/api/profiles", {
      method: editingUsername ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        ...(payload.edit_token ? { "x-edit-token": payload.edit_token } : {}),
        ...(state.editAdminPassword ? { "x-admin-password": state.editAdminPassword } : {})
      },
      body: JSON.stringify(payload)
    });
    fillResult(data.profile);
    setBanner(data.storage === "firebase" ? "Profile saved in Firebase." : "Profile saved in temporary memory fallback. Configure Firebase on Render for persistence.", data.storage === "firebase" ? "ok" : "warn");
    toast(editingUsername ? "Profile updated" : "Profile created");
    form.dataset.username = data.profile.username;
    $("#profileSubmit").textContent = "Update profile";
  } catch (err) {
    setBanner(err.message, "error");
  } finally {
    button.disabled = false;
    if (!form.dataset.username) button.textContent = "Save profile + generate QR";
  }
}

async function loadPublicProfile(username) {
  showOnly("publicView");
  $("#publicLoading").hidden = false;
  $("#publicContent").hidden = true;
  try {
    const data = await requestJson(`/api/profiles/${encodeURIComponent(username)}`);
    renderPublic(data.profile, "Profile QR");
  } catch (err) {
    renderPublicError(err.message);
  }
}

async function loadTag(slug) {
  showOnly("publicView");
  $("#publicLoading").hidden = false;
  $("#publicContent").hidden = true;
  try {
    const data = await requestJson(`/api/tags/${encodeURIComponent(slug)}`);
    renderPublic(data.profile, "Recovery Tag QR", data.tag);
  } catch (err) {
    renderPublicError(err.message);
  }
}

function renderPublic(profile, label, tag = null) {
  state.profile = profile;
  $("#publicLoading").hidden = true;
  $("#publicContent").hidden = false;
  const card = $(".mvp-public-card");
  card.className = `glass-panel mvp-public-card profile-theme theme-${profile.theme || "dark-mesh"}`;
  $("#publicBadge").textContent = tag ? "Recovery tag scanned" : "Verified myQRID";
  $("#scanAnimation").hidden = !tag;
  $("#publicAvatar").src = profile.image_url || initialsAvatar(profile.name);
  $("#publicName").textContent = profile.name;
  $("#publicBio").textContent = profile.bio || "This profile is powered by myQRID.";
  const analytics = profile.analytics || {};
  $("#publicStats").innerHTML = `<span><strong>${Number(analytics.total_views || 0)}</strong> views</span><span><strong>${Number(analytics.total_scans || 0)}</strong> scans</span><span><strong>${Number(analytics.total_leads || 0)}</strong> leads</span>`;
  renderSocialLinks(profile, $("#publicSocialLinks"));
  $("#recoveryPanel").hidden = !tag;
  const emergency = $("#emergencyPanel");
  if (profile.emergency_phone) {
    emergency.hidden = false;
    emergency.innerHTML = `<strong>Emergency contact</strong><span>${escapeHtml(profile.emergency_name || "Emergency contact")}</span><a href="tel:${escapeHtml(profile.emergency_phone)}" data-action="call_click">${escapeHtml(profile.emergency_phone)}</a>`;
    emergency.querySelector("a")?.addEventListener("click", () => track("call_click", profile.username, { source: "emergency" }));
  } else {
    emergency.hidden = true;
  }
  renderActionButtons(profile, $("#publicActions"));
  $("#publicQr").src = tag ? profile.tag_qr_url : profile.qr_url;
  $("#publicQrLabel").textContent = label;
  $("#publicDownloadQr").onclick = () => downloadQr(profile, Boolean(tag));
}

function renderPublicError(message) {
  $("#publicLoading").hidden = true;
  $("#publicContent").hidden = false;
  const card = $(".mvp-public-card");
  card.className = "glass-panel mvp-public-card";
  $("#publicBadge").textContent = "Not found";
  $("#scanAnimation").hidden = true;
  $("#publicAvatar").src = initialsAvatar("Not found");
  $("#publicName").textContent = "myQRID unavailable";
  $("#publicBio").textContent = message;
  $("#recoveryPanel").hidden = true;
  $("#emergencyPanel").hidden = true;
  $("#publicActions").innerHTML = `<a class="mvp-primary" href="/">Create a profile</a>`;
  $("#publicQr").removeAttribute("src");
  $("#publicQrLabel").textContent = "";
}

async function adminLoad(password) {
  const list = $("#adminList");
  list.innerHTML = `<p class="mvp-muted">Loading profiles…</p>`;
  try {
    const data = await requestJson("/api/admin/profiles", { headers: { "x-admin-password": password } });
    sessionStorage.setItem("myqrid_admin_password", password);
    state.adminPassword = password;
    state.adminProfiles = data.profiles || [];
    state.recentActivity = data.recent_activity || [];
    renderAdminMetrics(data.summary || {});
    renderAdminProfiles();
    renderActivity();
  } catch (err) {
    list.innerHTML = `<p class="mvp-error">${escapeHtml(err.message)}</p>`;
  }
}

function renderAdminMetrics(summary) {
  $("#metricProfiles").textContent = summary.total_profiles || 0;
  $("#metricScans").textContent = summary.total_scans || 0;
  $("#metricLeads").textContent = summary.total_leads || 0;
  $("#metricViews").textContent = summary.total_views || 0;
}

function renderAdminProfiles() {
  const list = $("#adminList");
  const query = ($("#adminSearch")?.value || "").toLowerCase();
  const profiles = state.adminProfiles.filter(profile => [profile.name, profile.username, profile.phone, profile.email].join(" ").toLowerCase().includes(query));
  if (!profiles.length) {
    list.innerHTML = `<p class="mvp-muted">No matching profiles.</p>`;
    return;
  }
  list.innerHTML = profiles.map(profile => {
    const analytics = profile.analytics || {};
    return `<div class="mvp-list-row" data-username="${escapeHtml(profile.username)}">
      <div><strong>${escapeHtml(profile.name)}</strong><small>@${escapeHtml(profile.username)} · ${escapeHtml(profile.phone)} · scans ${Number(analytics.total_scans || 0)} · leads ${Number(analytics.total_leads || 0)}</small></div>
      <div class="mvp-row-actions">
        <a class="mvp-secondary" href="/u/${escapeHtml(profile.username)}" target="_blank">Open</a>
        <button class="mvp-secondary" data-admin-edit="${escapeHtml(profile.username)}" type="button">Edit</button>
        <button class="mvp-danger" data-delete="${escapeHtml(profile.username)}" type="button">Delete</button>
      </div>
    </div>`;
  }).join("");
  list.querySelectorAll("[data-delete]").forEach(button => button.addEventListener("click", () => adminDelete(button.dataset.delete)));
  list.querySelectorAll("[data-admin-edit]").forEach(button => button.addEventListener("click", () => adminEdit(button.dataset.adminEdit)));
}

function renderActivity() {
  const list = $("#activityList");
  if (!state.recentActivity.length) {
    list.innerHTML = `<p class="mvp-muted">No recent activity yet.</p>`;
    return;
  }
  list.innerHTML = state.recentActivity.slice(0, 30).map(event => `<div class="activity-row"><strong>${escapeHtml(event.action)}</strong><span>@${escapeHtml(event.username || "unknown")} · ${escapeHtml(event.device_type || "unknown")} · ${new Date(event.created_at || event.timestamp).toLocaleString()}</span></div>`).join("");
}

function adminEdit(username) {
  const profile = state.adminProfiles.find(item => item.username === username);
  if (!profile) return;
  showOnly("createView");
  state.editAdminPassword = state.adminPassword;
  loadProfileIntoForm(profile);
  const form = $("#profileForm");
  form.elements.edit_token.value = profile.edit_token || "";
  toast("Loaded profile for editing");
}

async function adminDelete(username) {
  if (!confirm(`Delete @${username}?`)) return;
  try {
    await requestJson(`/api/admin/profiles/${encodeURIComponent(username)}`, {
      method: "DELETE",
      headers: { "x-admin-password": state.adminPassword }
    });
    toast("Profile deleted");
    adminLoad(state.adminPassword);
  } catch (err) {
    toast(err.message);
  }
}

function initAdmin() {
  showOnly("adminView");
  $("#adminSearch")?.addEventListener("input", renderAdminProfiles);
  if (state.adminPassword) adminLoad(state.adminPassword);
}

function linksFromProfileFields(profile = {}) {
  return DEFAULT_LINKS.map(link => ({
    ...link,
    value: link.type === "whatsapp" ? (profile.whatsapp || profile.phone || "") : link.type === "email" ? (profile.email || "") : link.type === "website" ? (profile.website || "") : ""
  }));
}

function linkRowTemplate(link = {}, index = 0) {
  const options = Object.entries(SOCIAL_TYPES).map(([value, cfg]) => `<option value="${value}" ${link.type === value ? "selected" : ""}>${cfg.label}</option>`).join("");
  return `<div class="link-row" draggable="true" data-index="${index}">
    <button class="drag-handle" type="button" aria-label="Drag link">☰</button>
    <select data-link-field="type">${options}</select>
    <input data-link-field="label" placeholder="Button label" value="${escapeHtml(link.label || "")}">
    <input data-link-field="value" placeholder="URL, handle, phone or email" value="${escapeHtml(link.value || "")}">
    <label class="visibility-toggle"><input data-link-field="enabled" type="checkbox" ${link.enabled === false ? "" : "checked"}> Visible</label>
    <button class="remove-link" type="button" aria-label="Remove link">×</button>
  </div>`;
}

function readLinkRows() {
  return $$("#linkBuilder .link-row").map((row, index) => ({
    id: `link-${index + 1}`,
    type: row.querySelector('[data-link-field="type"]').value,
    label: row.querySelector('[data-link-field="label"]').value.trim(),
    value: row.querySelector('[data-link-field="value"]').value.trim(),
    enabled: row.querySelector('[data-link-field="enabled"]').checked,
    order: index
  })).filter(link => link.label || link.value);
}

function syncLinksJson() {
  const input = $("#linksJson");
  if (input) input.value = JSON.stringify(readLinkRows());
}

function setLinkRows(links = DEFAULT_LINKS) {
  const builder = $("#linkBuilder");
  if (!builder) return;
  const safeLinks = links.length ? links : DEFAULT_LINKS;
  builder.innerHTML = safeLinks.map(linkRowTemplate).join("");
  wireLinkRows();
  syncLinksJson();
}

function wireLinkRows() {
  const builder = $("#linkBuilder");
  if (!builder) return;
  let dragged = null;
  builder.querySelectorAll(".link-row").forEach(row => {
    row.addEventListener("dragstart", event => { dragged = row; event.dataTransfer.effectAllowed = "move"; });
    row.addEventListener("dragover", event => event.preventDefault());
    row.addEventListener("drop", event => {
      event.preventDefault();
      if (dragged && dragged !== row) {
        const rows = $$("#linkBuilder .link-row");
        const from = rows.indexOf(dragged);
        const to = rows.indexOf(row);
        builder.insertBefore(dragged, from < to ? row.nextSibling : row);
        syncLinksJson();
      }
    });
    row.querySelector(".remove-link")?.addEventListener("click", () => { row.remove(); syncLinksJson(); });
    row.querySelectorAll("input, select").forEach(input => input.addEventListener("input", syncLinksJson));
  });
}

function initLinkEditor() {
  setLinkRows(DEFAULT_LINKS);
  $("#addLinkRow")?.addEventListener("click", () => {
    const links = readLinkRows();
    links.push({ type: "custom", label: "New link", value: "", enabled: true });
    setLinkRows(links);
  });
}

function init() {
  loadStatus();
  initLinkEditor();
  const route = routeInfo();
  $("#profileForm")?.addEventListener("submit", createProfile);
  $("#adminLoginForm")?.addEventListener("submit", event => {
    event.preventDefault();
    adminLoad(formPayload(event.currentTarget).password);
  });

  if (route.section !== "admin") state.editAdminPassword = "";
  if (route.section === "u" && route.value) return loadPublicProfile(route.value);
  if (route.section === "t" && route.value) return loadTag(route.value);
  if (route.section === "admin") return initAdmin();
  showOnly("createView");
}

document.addEventListener("DOMContentLoaded", init);
