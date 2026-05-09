const assert = require("assert");

const baseUrl = (process.env.SMOKE_BASE_URL || process.env.PUBLIC_BASE_URL || "").replace(/\/$/, "");
const adminPassword = process.env.SMOKE_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || process.env.SETUP_SECRET || "";

if (!baseUrl) {
  console.error("Set SMOKE_BASE_URL or PUBLIC_BASE_URL to your Render URL, for example https://myqrid-backend.onrender.com");
  process.exit(1);
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    throw new Error(`${options.method || "GET"} ${path} failed ${response.status}: ${typeof body === "string" ? body.slice(0, 200) : JSON.stringify(body)}`);
  }
  return { response, body, contentType };
}

(async () => {
  console.log(`Smoke testing ${baseUrl}`);

  const root = await request("/");
  assert(root.contentType.includes("text/html"), "root should return HTML");

  const status = await request("/api/status");
  assert.strictEqual(status.body.success, true, "status should be successful");
  console.log(`storage=${status.body.storage}`);

  const unique = Date.now().toString(36);
  const create = await request("/api/profiles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `Smoke Test ${unique}`,
      phone: "+15551234567",
      whatsapp: "+15551234567",
      email: `smoke-${unique}@example.com`,
      bio: "Automated Render smoke test profile",
      image_url: "https://example.com/photo.jpg"
    })
  });

  assert.strictEqual(create.body.success, true, "profile create should be successful");
  const { username, tag_slug: tagSlug, profile_url: profileUrl, tag_url: tagUrl, qr_url: qrUrl } = create.body.profile;
  assert(username, "username should be generated");
  assert(tagSlug, "tag slug should be generated");
  assert(profileUrl && profileUrl.includes(`/u/${username}`), "profile URL should point to username");
  assert(tagUrl && tagUrl.includes(`/t/${tagSlug}`), "tag URL should point to tag");
  assert(qrUrl && qrUrl.includes("/api/qr"), "QR URL should be generated");

  const profile = await request(`/api/profiles/${encodeURIComponent(username)}`);
  assert.strictEqual(profile.body.profile.username, username, "profile fetch should return created username");

  const edit = await request(`/api/profiles/${encodeURIComponent(username)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "x-edit-token": create.body.profile.edit_token },
    body: JSON.stringify({
      ...create.body.profile,
      bio: "Updated by automated smoke test",
      emergency_name: "Smoke Emergency",
      emergency_phone: "+15557654321"
    })
  });
  assert.strictEqual(edit.body.profile.bio, "Updated by automated smoke test", "profile edit should persist");

  const tag = await request(`/api/tags/${encodeURIComponent(tagSlug)}`);
  assert.strictEqual(tag.body.profile.username, username, "tag fetch should resolve owner profile");

  const publicProfile = await request(`/u/${encodeURIComponent(username)}`);
  assert(publicProfile.contentType.includes("text/html"), "public profile should return HTML");

  const publicTag = await request(`/t/${encodeURIComponent(tagSlug)}`);
  assert(publicTag.contentType.includes("text/html"), "public tag should return HTML");

  await request("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, action: "whatsapp_click", metadata: { source: "smoke" } })
  });
  await request("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, action: "call_click", metadata: { source: "smoke" } })
  });

  const qr = await request(`/api/qr?data=${encodeURIComponent(profileUrl)}`);
  assert(qr.contentType.includes("image/png"), "QR endpoint should return PNG");

  if (adminPassword) {
    const admin = await request("/api/admin/profiles", { headers: { "x-admin-password": adminPassword } });
    assert(Array.isArray(admin.body.profiles), "admin profiles should return an array");
    assert(admin.body.summary && typeof admin.body.summary.total_profiles === "number", "admin summary should include totals");
    assert(Array.isArray(admin.body.recent_activity), "admin recent activity should return an array");
    await request(`/api/admin/profiles/${encodeURIComponent(username)}`, {
      method: "DELETE",
      headers: { "x-admin-password": adminPassword }
    });
    console.log("admin delete verified");
  } else {
    console.log("admin delete skipped because no SMOKE_ADMIN_PASSWORD/ADMIN_PASSWORD/SETUP_SECRET was provided");
  }

  console.log(`Smoke test passed for ${username} (${tagSlug})`);
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
