const state = {
  profile: null,
  adminPassword:
    sessionStorage.getItem(
      "myqrid_admin_password"
    ) || ""
};

const $ = selector =>
  document.querySelector(selector);

function routeInfo() {
  const parts =
    window.location.pathname
      .split("/")
      .filter(Boolean);

  return {
    section: parts[0] || "create",
    value: decodeURIComponent(
      parts[1] || ""
    )
  };
}

function showOnly(id) {
  [
    "createView",
    "publicView",
    "adminView"
  ].forEach(viewId => {

    const el = $("#" + viewId);

    if (el) {
      el.hidden = viewId !== id;
    }
  });
}

function setBanner(
  message,
  type = "info"
) {
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

  setTimeout(() => {
    el.classList.remove("show");
  }, 2200);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(
      /[&<>"']/g,
      char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[char]
    );
}

function initialsAvatar(name) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    name || "myQRID"
  )}`;
}

async function requestJson(
  url,
  options = {}
) {

  const response = await fetch(
    url,
    options
  );

  const text =
    await response.text();

  let data = {};

  try {

    data = text
      ? JSON.parse(text)
      : {};

  } catch {

    data = {
      error:
        text ||
        "Unexpected response"
    };
  }

  if (!response.ok) {
    throw new Error(
      data.error ||
      `Request failed with ${response.status}`
    );
  }

  return data;
}

function formPayload(form) {
  return Object.fromEntries(
    new FormData(form).entries()
  );
}

function vcard(profile) {
  const phone =
    profile.phone || "";

  const whatsapp =
    profile.whatsapp || phone;

  return [
    "BEGIN:VCARD",
    "VERSION:3.0",

    `FN:${
      profile.name ||
      profile.username
    }`,

    phone
      ? `TEL;TYPE=CELL:${phone}`
      : "",

    profile.email
      ? `EMAIL:${profile.email}`
      : "",

    profile.profile_url
      ? `URL:${profile.profile_url}`
      : "",

    whatsapp
      ? `NOTE:WhatsApp ${whatsapp}`
      : "",

    "END:VCARD"
  ]
    .filter(Boolean)
    .join("\n");
}

function downloadVcf(profile) {

  const blob = new Blob(
    [vcard(profile)],
    {
      type:
        "text/vcard;charset=utf-8"
    }
  );

  const a =
    document.createElement("a");

  a.href =
    URL.createObjectURL(blob);

  a.download =
    `${profile.username}.vcf`;

  a.click();

  URL.revokeObjectURL(a.href);

  track(
    "save_contact",
    profile.username
  );
}

async function copyText(
  text,
  label = "Copied"
) {

  try {

    await navigator.clipboard
      .writeText(text);

    toast(label);

  } catch {

    toast(
      "Unable to copy text"
    );
  }
}

function whatsappUrl(profile) {

  const digits = String(
    profile.whatsapp ||
    profile.phone ||
    ""
  ).replace(/\D/g, "");

  return `https://wa.me/${digits}?text=${encodeURIComponent(
    "Hi, I found your myQRID profile: " +
    profile.profile_url
  )}`;
}

function renderActionButtons(
  profile,
  mount
) {

  mount.innerHTML = `
    <a
      class="mvp-primary"
      href="tel:${escapeHtml(
        profile.phone
      )}"
    >
      Call
    </a>

    <a
      class="mvp-secondary"
      href="${escapeHtml(
        whatsappUrl(profile)
      )}"
      target="_blank"
      rel="noreferrer"
    >
      WhatsApp
    </a>

    <button
      class="mvp-secondary"
      id="saveVcf"
      type="button"
    >
      Save Contact
    </button>

    <button
      class="mvp-secondary"
      id="copyLink"
      type="button"
    >
      Copy profile link
    </button>
  `;

  mount
    .querySelector(
      "a[href^='tel:']"
    )
    ?.addEventListener(
      "click",
      () =>
        track(
          "call",
          profile.username
        )
    );

  mount
    .querySelector(
      "a[href^='https://wa.me']"
    )
    ?.addEventListener(
      "click",
      () =>
        track(
          "whatsapp",
          profile.username
        )
    );

  mount
    .querySelector("#saveVcf")
    ?.addEventListener(
      "click",
      () =>
        downloadVcf(profile)
    );

  mount
    .querySelector("#copyLink")
    ?.addEventListener(
      "click",
      () =>
        copyText(
          profile.profile_url,
          "Profile link copied"
        )
    );
}

async function track(
  action,
  username
) {

  if (!username) return;

  try {

    await requestJson(
      "/api/track",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          username,
          action
        })
      }
    );

  } catch {
    // ignore
  }
}

async function loadStatus() {

  try {

    const status =
      await requestJson(
        "/api/status"
      );

    if (
      !status.firebase_configured
    ) {

      setBanner(
        "Firebase not configured.",
        "warn"
      );

    } else {

      setBanner(
        "Firebase connected.",
        "ok"
      );
    }

  } catch (err) {

    setBanner(
      err.message,
      "error"
    );
  }
}

function fillResult(profile) {

  state.profile = profile;

  $("#resultCard").hidden =
    false;

  $("#resultAvatar").src =
    profile.image_url ||
    initialsAvatar(profile.name);

  $("#resultName").textContent =
    profile.name;

  $("#resultUsername").textContent =
    `@${profile.username}`;

  $("#resultProfileUrl").textContent =
    profile.profile_url;

  $("#resultProfileUrl").href =
    profile.profile_url;

  $("#resultTagUrl").textContent =
    profile.tag_url;

  $("#resultTagUrl").href =
    profile.tag_url;

  $("#resultProfileQr").src =
    profile.qr_url;

  $("#resultTagQr").src =
    profile.tag_qr_url;

  $("#copyProfileLink").onclick =
    () =>
      copyText(
        profile.profile_url,
        "Profile link copied"
      );

  $("#downloadResultVcf").onclick =
    () =>
      downloadVcf(profile);
}

async function createProfile(
  event
) {

  event.preventDefault();

  const button =
    event.currentTarget.querySelector(
      "button[type='submit']"
    );

  button.disabled = true;

  button.textContent =
    "Saving…";

  setBanner(
    "Saving profile…",
    "info"
  );

  try {

    const data =
      await requestJson(
        "/api/profiles",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify(
            formPayload(
              event.currentTarget
            )
          )
        }
      );

    fillResult(data.profile);

    setBanner(
      data.storage ===
        "firebase"
        ? "Profile saved in Firebase."
        : "Temporary memory fallback active.",
      data.storage ===
        "firebase"
        ? "ok"
        : "warn"
    );

    toast(
      "Profile created"
    );

  } catch (err) {

    setBanner(
      err.message,
      "error"
    );

  } finally {

    button.disabled = false;

    button.textContent =
      "Save profile + generate QR";
  }
}

async function loadPublicProfile(
  username
) {

  showOnly("publicView");

  $("#publicLoading").hidden =
    false;

  $("#publicContent").hidden =
    true;

  try {

    const data =
      await requestJson(
        `/api/profiles/${encodeURIComponent(
          username
        )}`
      );

    renderPublic(
      data.profile,
      "Profile QR"
    );

  } catch (err) {

    renderPublicError(
      err.message
    );
  }
}

async function loadTag(slug) {

  showOnly("publicView");

  $("#publicLoading").hidden =
    false;

  $("#publicContent").hidden =
    true;

  try {

    const data =
      await requestJson(
        `/api/tags/${encodeURIComponent(
          slug
        )}`
      );

    renderPublic(
      data.profile,
      "Tag QR",
      data.tag
    );

  } catch (err) {

    renderPublicError(
      err.message
    );
  }
}

function renderPublic(
  profile,
  label,
  tag = null
) {

  state.profile = profile;

  $("#publicLoading").hidden =
    true;

  $("#publicContent").hidden =
    false;

  $("#publicBadge").textContent =
    tag
      ? "myQRID tag scan"
      : "Verified myQRID";

  $("#publicAvatar").src =
    profile.image_url ||
    initialsAvatar(profile.name);

  $("#publicName").textContent =
    profile.name;

  $("#publicBio").textContent =
    profile.bio ||
    "This profile is powered by myQRID.";

  renderActionButtons(
    profile,
    $("#publicActions")
  );

  $("#publicQr").src =
    tag
      ? profile.tag_qr_url
      : profile.qr_url;

  $("#publicQrLabel").textContent =
    label;
}

function renderPublicError(
  message
) {

  $("#publicLoading").hidden =
    true;

  $("#publicContent").hidden =
    false;

  $("#publicBadge").textContent =
    "Not found";

  $("#publicAvatar").src =
    initialsAvatar(
      "Not found"
    );

  $("#publicName").textContent =
    "myQRID unavailable";

  $("#publicBio").textContent =
    message;

  $("#publicActions").innerHTML =
    `
      <a
        class="mvp-primary"
        href="/"
      >
        Create a profile
      </a>
    `;

  $("#publicQr")
    .removeAttribute("src");

  $("#publicQrLabel").textContent =
    "";
}

async function adminLoad(
  password
) {

  const list =
    $("#adminList");

  list.innerHTML =
    `
      <p class="mvp-muted">
        Loading profiles…
      </p>
    `;

  try {

    const data =
      await requestJson(
        "/api/admin/profiles",
        {
          headers: {
            "x-admin-password":
              password
          }
        }
      );

    sessionStorage.setItem(
      "myqrid_admin_password",
      password
    );

    state.adminPassword =
      password;

    if (
      !data.profiles.length
    ) {

      list.innerHTML =
        `
          <p class="mvp-muted">
            No profiles yet.
          </p>
        `;

      return;
    }

    list.innerHTML =
      data.profiles
        .map(profile => `
          <div
            class="mvp-list-row"
          >
            <div>
              <strong>
                ${escapeHtml(
                  profile.name
                )}
              </strong>

              <small>
                @${escapeHtml(
                  profile.username
                )}
              </small>
            </div>

            <div
              class="mvp-row-actions"
            >

              <a
                class="mvp-secondary"
                href="/u/${escapeHtml(
                  profile.username
                )}"
                target="_blank"
              >
                Open
              </a>

              <button
                class="mvp-danger"
                data-delete="${escapeHtml(
                  profile.username
                )}"
                type="button"
              >
                Delete
              </button>

            </div>
          </div>
        `)
        .join("");

    list
      .querySelectorAll(
        "[data-delete]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () =>
            adminDelete(
              button.dataset.delete
            )
        );
      });

  } catch (err) {

    list.innerHTML =
      `
        <p class="mvp-error">
          ${escapeHtml(
            err.message
          )}
        </p>
      `;
  }
}

async function adminDelete(
  username
) {

  if (
    !confirm(
      `Delete @${username}?`
    )
  ) {
    return;
  }

  try {

    await requestJson(
      `/api/admin/profiles/${encodeURIComponent(
        username
      )}`,
      {
        method: "DELETE",

        headers: {
          "x-admin-password":
            state.adminPassword
        }
      }
    );

    toast(
      "Profile deleted"
    );

    adminLoad(
      state.adminPassword
    );

  } catch (err) {

    toast(err.message);
  }
}

function initAdmin() {

  showOnly("adminView");

  if (
    state.adminPassword
  ) {

    adminLoad(
      state.adminPassword
    );
  }
}

function init() {

  loadStatus();

  const route =
    routeInfo();

  $("#profileForm")
    ?.addEventListener(
      "submit",
      createProfile
    );

  $("#adminLoginForm")
    ?.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        adminLoad(
          formPayload(
            event.currentTarget
          ).password
        );
      }
    );

  if (
    route.section === "u" &&
    route.value
  ) {
    return loadPublicProfile(
      route.value
    );
  }

  if (
    route.section === "t" &&
    route.value
  ) {
    return loadTag(
      route.value
    );
  }

  if (
    route.section === "admin"
  ) {
    return initAdmin();
  }

  showOnly("createView");
}

document.addEventListener(
  "DOMContentLoaded",
  init
);