const API = window.location.origin;
const state = { profile: null, adminTags: [], activity: [] };
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

function showView(name) {
  $$(".mvp-view").forEach(view => view.classList.toggle("active", view.id === `view-${name}`));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function postJson(url, payload) {
  return fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(r => r.json().then(data => ({ ok: r.ok, data })));
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function profileUrl(username) {
  return `${API}/u/${encodeURIComponent(username)}`;
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function publicPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  return { type: parts[0] || "", value: decodeURIComponent(parts[1] || "") };
}

function publicProfileMarkup(profile, tag = null) {
  const avatar = profile.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=" + encodeURIComponent(profile.display_name || profile.username || "myQRID");
  const links = [
    profile.instagram && { title: "Instagram", url: profile.instagram },
    profile.youtube && { title: "YouTube", url: profile.youtube },
    profile.linkedin && { title: "LinkedIn", url: profile.linkedin },
    ...(Array.isArray(profile.links) ? profile.links : [])
  ].filter(link => link && link.url);
  const lost = tag?.returnme || profile.lost_item;
  return `<section class="mvp-public glass-panel">
    <span class="mvp-pill">Verified myQRID</span>
    <img class="public-avatar" src="${escapeHtml(avatar)}" alt="${escapeHtml(profile.display_name || profile.username)}">
    <h1>${escapeHtml(profile.display_name || profile.username)}</h1>
    <p class="mvp-muted">${escapeHtml([profile.profession, profile.location].filter(Boolean).join(" • "))}</p>
    <p>${escapeHtml(profile.bio || "This public profile is powered by myQRID.")}</p>
    ${lost ? `<div class="mvp-alert"><strong>ReturnMe item:</strong> ${escapeHtml(lost.item_name || tag?.tag_type || "Lost item")}<br><span>${escapeHtml(lost.return_instructions || "Please contact the owner using the buttons below.")}</span>${lost.reward_amount ? `<br><strong>Reward:</strong> ${escapeHtml(lost.reward_amount)}` : ""}</div>` : ""}
    <div class="mvp-actions" id="publicActions"></div>
    ${links.length ? `<div class="mvp-list public-links">${links.map(link => `<a class="mvp-list-row" href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer" data-action="link_${escapeHtml(link.title)}"><strong>${escapeHtml(link.title)}</strong><span>Open</span></a>`).join("")}</div>` : ""}
  </section>`;
}

function inactiveTagMarkup(tag) {
  return `<section class="mvp-public glass-panel">
    <span class="mvp-pill">myQRID activation</span>
    <h1>Activate tag ${escapeHtml(tag.slug || "")}</h1>
    <p>This physical QR is ready to claim. Enter the printed claim ID and your username to connect it to a profile.</p>
    <form class="mvp-form public-activate-form" id="publicActivateForm">
      <input name="claim_id" placeholder="Claim ID" value="${escapeHtml(tag.claim_id || "")}" required>
      <input name="username" placeholder="Your username" required>
      <select name="profile_type">
        <option value="digital_identity">Digital Identity</option>
        <option value="returnme">ReturnMe / Lost Item</option>
        <option value="pet">Pet</option>
        <option value="vehicle">Vehicle</option>
        <option value="asset">Asset</option>
      </select>
      <input name="item_name" placeholder="Lost item name (optional)">
      <input name="reward_amount" placeholder="Reward amount (optional)">
      <textarea name="return_instructions" placeholder="Return instructions (optional)"></textarea>
      <button class="mvp-primary" type="submit">Activate ownership</button>
    </form>
    <p id="activationResult" class="mvp-muted">If you found this item, ask the owner to activate the tag first or contact myQRID support.</p>
    <div id="tagQr" class="mvp-qr-box large"></div>
    <a id="openTagPage" class="mvp-secondary" href="#" target="_blank">Open tag/finder page</a>
  </section>`;
}

function publicErrorMarkup(title, message) {
  return `<section class="mvp-public glass-panel"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p><a class="mvp-primary" href="/web-mvp.html">Create a myQRID</a></section>`;
}

function mountPublicView(html) {
  $(".mvp-nav")?.classList.add("public-mode");
  $(".mvp-shell").innerHTML = `<section class="mvp-view active">${html}</section>`;
}

async function loadPublicProfile(username) {
  mountPublicView('<section class="mvp-public glass-panel"><h1>Loading profile…</h1></section>');
  const response = await fetch(`/api/mvp/profile/${encodeURIComponent(username)}`);
  const data = await response.json();
  if (!response.ok) {
    mountPublicView(publicErrorMarkup("Profile not found", data.error || "This myQRID profile is not available yet."));
    return;
  }
  state.profile = data.profile;
  mountPublicView(publicProfileMarkup(data.profile));
  renderProfileActions(data.profile, $("#publicActions"));
  $(".public-links")?.querySelectorAll("a[data-action]").forEach(link => link.addEventListener("click", () => track(link.dataset.action)));
}

async function loadPublicTag(slug) {
  mountPublicView('<section class="mvp-public glass-panel"><h1>Loading tag…</h1></section>');
  const response = await fetch(`/api/mvp/tag/${encodeURIComponent(slug)}`);
  const data = await response.json();
  if (!response.ok) {
    mountPublicView(publicErrorMarkup("Tag not found", data.error || "This QR tag is not available yet."));
    return;
  }
  const tag = data.tag;
  if (tag.status !== "active" || !tag.owner_username) {
    mountPublicView(inactiveTagMarkup(tag));
    $("#publicActivateForm")?.addEventListener("submit", activateTag);
    return;
  }
  const profileResponse = await fetch(`/api/mvp/profile/${encodeURIComponent(tag.owner_username)}`);
  const profileData = await profileResponse.json();
  if (!profileResponse.ok) {
    mountPublicView(publicErrorMarkup("Owner profile pending", "This tag is active, but the public owner profile still needs to be completed."));
    return;
  }
  state.profile = profileData.profile;
  mountPublicView(publicProfileMarkup(profileData.profile, tag));
  renderProfileActions(profileData.profile, $("#publicActions"));
}

function track(action, metadata = {}) {
  const username = state.profile?.username || $("[name='username']")?.value;
  state.activity.unshift({ action, time: new Date().toLocaleString(), metadata });
  renderActivity();
  if (username) postJson("/api/mvp/track", { username, action, metadata }).catch(() => {});
}

function makeQr(target, value, options = {}) {
  const el = typeof target === "string" ? $(target) : target;
  el.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = `mvp-qr-render ${options.gradient ? "gradient" : ""}`;
  const qrNode = document.createElement("div");
  wrap.appendChild(qrNode);
  if (options.logo) {
    const logo = document.createElement("div");
    logo.className = "mvp-qr-logo";
    logo.textContent = "mQ";
    wrap.appendChild(logo);
  }
  el.appendChild(wrap);
  new QRCode(qrNode, { text: value, width: options.size || 210, height: options.size || 210, colorDark: "#111827", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.H });
}

function downloadQr(targetId, filename) {
  const img = document.querySelector(`${targetId} img`) || document.querySelector(`${targetId} canvas`);
  if (!img) return;
  const a = document.createElement("a");
  a.download = filename;
  a.href = img.tagName === "CANVAS" ? img.toDataURL("image/png") : img.src;
  a.click();
  track("qr_download", { filename });
}

function vcard(profile) {
  const phone = profile.phone || "";
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${profile.display_name || profile.username}`,
    profile.profession ? `TITLE:${profile.profession}` : "",
    profile.organization ? `ORG:${profile.organization}` : "",
    phone ? `TEL;TYPE=CELL:${phone}` : "",
    profile.email ? `EMAIL:${profile.email}` : "",
    profile.website ? `URL:${profile.website}` : `URL:${profile.profile_url}`,
    `NOTE:WhatsApp ${profile.whatsapp || phone} | myQRID ${profile.profile_url}`,
    "END:VCARD"
  ].filter(Boolean).join("\n");
}

function saveContact(profile) {
  const blob = new Blob([vcard(profile)], { type: "text/vcard" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${profile.username}-myqrid.vcf`;
  a.click();
  URL.revokeObjectURL(a.href);
  track("save_contact");
}

function renderProfileActions(profile, container) {
  const wa = normalizePhone(profile.whatsapp || profile.phone);
  const actions = [
    profile.phone && { label: "Call", href: `tel:${profile.phone}`, action: "call" },
    wa && { label: "WhatsApp", href: `https://wa.me/${wa}?text=${encodeURIComponent("Hi, I found you via myQRID")}`, action: "whatsapp" },
    profile.email && { label: "Email", href: `mailto:${profile.email}`, action: "email" },
    profile.website && { label: "Website", href: profile.website, action: "website" }
  ].filter(Boolean);
  container.innerHTML = actions.map(item => `<a class="mvp-secondary" target="_blank" rel="noreferrer" data-action="${item.action}" href="${item.href}">${item.label}</a>`).join("") + `<button class="mvp-primary" id="saveVcf">Save Contact</button>`;
  container.querySelectorAll("a[data-action]").forEach(link => link.addEventListener("click", () => track(link.dataset.action)));
  container.querySelector("#saveVcf")?.addEventListener("click", () => saveContact(profile));
}

function renderActivity() {
  if (!$("#metricScans") || !$("#activityList")) return;
  const metrics = state.profile?.analytics || {};
  $("#metricScans").textContent = metrics.total_views || state.activity.length;
  $("#metricViews").textContent = metrics.total_views || 0;
  $("#metricClicks").textContent = metrics.total_clicks || 0;
  const clicks = metrics.link_clicks || {};
  const top = Object.entries(clicks).sort((a, b) => b[1] - a[1])[0]?.[0] || "WhatsApp";
  $("#metricTopCta").textContent = top;
  $("#activityList").innerHTML = state.activity.slice(0, 10).map(item => `<div class="mvp-list-row"><strong>${item.action}</strong><span>${item.time}</span></div>`).join("") || "<p>No activity yet.</p>";
}

async function createProfile(event) {
  event.preventDefault();
  const payload = formData(event.currentTarget);
  payload.links = ["website", "instagram", "youtube", "linkedin"].map(key => ({ title: key, url: payload[key] })).filter(link => link.url);
  const { ok, data } = await postJson("/api/mvp/profile", payload);
  if (!ok) return alert(data.error || "Unable to save profile");
  state.profile = data.profile;
  const url = profileUrl(data.profile.username);
  $("#profileResult").textContent = url;
  $("#openPublicProfile").href = url;
  $("#qrValue").value = url;
  makeQr("#profileQr", url, { logo: true, gradient: true });
  makeQr("#landingQr", url, { logo: true, gradient: true, size: 160 });
  $("#landingName").textContent = data.profile.display_name;
  track("profile_saved");
}

async function activateTag(event) {
  event.preventDefault();
  const payload = formData(event.currentTarget);
  payload.returnme = { item_name: payload.item_name, reward_amount: payload.reward_amount, return_instructions: payload.return_instructions };
  const { ok, data } = await postJson("/api/mvp/activate", payload);
  if (!ok) return alert(data.error || "Activation failed");
  if ($("#activationResult")) $("#activationResult").textContent = `Activated ${data.tag.slug} for @${data.tag.owner_username}`;
  if ($("#openTagPage")) $("#openTagPage").href = data.public_url;
  if ($("#tagQr")) makeQr("#tagQr", data.public_url, { logo: true, gradient: true });
  track("tag_activated", { slug: data.tag.slug });
}

async function adminGenerate(event) {
  event.preventDefault();
  const payload = formData(event.currentTarget);
  const { ok, data } = await postJson(`/api/admin/mvp/generate-tags?key=${encodeURIComponent(payload.key)}`, payload);
  if (!ok) return alert(data.error || "Admin generation failed");
  state.adminTags = data.tags;
  renderAdminTags();
}

function renderAdminTags() {
  $("#adminTagList").innerHTML = state.adminTags.map(tag => `<div class="mvp-list-row"><div><strong>${tag.slug}</strong><small>${tag.claim_id}</small></div><button data-qr="${tag.qr_url || `${API}/t/${tag.slug}`}">QR</button></div>`).join("") || "<p>No tags generated yet.</p>";
  $("#adminTagList").querySelectorAll("button[data-qr]").forEach(btn => btn.addEventListener("click", () => { $("#qrValue").value = btn.dataset.qr; makeQr("#customQr", btn.dataset.qr, { logo: true, gradient: true }); showView("qr"); }));
}

function exportCsv() {
  const rows = [["slug", "claim_id", "tag_type", "qr_url"], ...state.adminTags.map(tag => [tag.slug, tag.claim_id, tag.tag_type, tag.qr_url || `${API}/t/${tag.slug}`])];
  const csv = rows.map(row => row.map(value => `"${String(value || "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "myqrid-tags.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

function initAppShell() {
  $$('[data-view]').forEach(button => button.addEventListener("click", () => showView(button.dataset.view)));
  $("#profileForm").addEventListener("submit", createProfile);
  $("#activateForm").addEventListener("submit", activateTag);
  $("#adminGenerateForm").addEventListener("submit", adminGenerate);
  $("#exportCsv").addEventListener("click", exportCsv);
  $("#downloadProfileQr").addEventListener("click", () => downloadQr("#profileQr", "myqrid-profile.png"));
  $("#downloadCustomQr").addEventListener("click", () => downloadQr("#customQr", "myqrid-custom-qr.png"));
  $("#renderCustomQr").addEventListener("click", () => makeQr("#customQr", $("#qrValue").value, { logo: $("#qrLogo").checked, gradient: $("#qrGradient").checked }));
  makeQr("#landingQr", `${API}/u/demo`, { logo: true, gradient: true, size: 160 });
  makeQr("#customQr", $("#qrValue").value, { logo: true, gradient: true });
  renderActivity();
}

function init() {
  const route = publicPath();
  if (route.type === "u" && route.value) return loadPublicProfile(route.value);
  if (route.type === "t" && route.value) return loadPublicTag(route.value);
  return initAppShell();
}

document.addEventListener("DOMContentLoaded", init);
