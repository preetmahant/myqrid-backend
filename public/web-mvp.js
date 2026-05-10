(function () {

  function showView(id) {
    document.querySelectorAll(".view").forEach(function (v) {
      v.classList.remove("active");
    });
    var el = document.getElementById(id);
    if (el) el.classList.add("active");
  }

  function escHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function loadProfile(username) {
    showView("view-profile");
    var container = document.getElementById("profileContainer");
    if (!container) return;

    container.innerHTML = '<div class="mvp-loading"><p>Loading profile...</p></div>';

    fetch("/api/profiles/" + encodeURIComponent(username))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.success && data.profile) {
          if (typeof window.renderProfileCard === "function") {
            window.renderProfileCard(data.profile, container);
          }
        } else {
          container.innerHTML =
            '<div class="mvp-error glass-panel">' +
              '<h2>Profile not found</h2>' +
              '<p>No profile exists for @' + escHtml(username) + '</p>' +
              '<a href="/" class="action-button">Back to home</a>' +
            '</div>';
        }
      })
      .catch(function () {
        container.innerHTML =
          '<div class="mvp-error glass-panel">' +
            '<h2>Could not load profile</h2>' +
            '<p>Check your connection and try again.</p>' +
            '<a href="/" class="action-button">Back to home</a>' +
          '</div>';
      });
  }

  var PAGE_INFO = {
    "/products":  { title: "Earn + My Products",       msg: "Product management and tag activation coming in Phase 2.", nav: "products"  },
    "/scan":      { title: "Scan & Pay",                msg: "QR scan and payment features coming in Phase 2.",          nav: "home"      },
    "/analytics": { title: "Analytics",                 msg: "Scan analytics and click tracking coming in Phase 2.",     nav: "analytics" },
    "/rewards":   { title: "Rewards & Earn",            msg: "Points, badges and referrals coming in Phase 2.",          nav: "rewards"   }
  };

  function boot() {
    var path = window.location.pathname;

    // Wire action tiles (always, regardless of view shown)
    document.querySelectorAll(".action-tile[data-href]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.location.href = btn.getAttribute("data-href");
      });
    });

    var backBtn = document.getElementById("placeholder-back");
    if (backBtn) {
      backBtn.addEventListener("click", function () {
        window.location.href = "/";
      });
    }

    // /u/:username — public profile
    var profileM = path.match(/^\/u\/([^/]+)/);
    if (profileM && profileM[1] !== "me") {
      loadProfile(profileM[1]);
      if (typeof window.initNav === "function") window.initNav("profile");
      return;
    }

    // /t/:slug — tag scan (resolve to profile for now)
    var tagM = path.match(/^\/t\/([^/]+)/);
    if (tagM) {
      loadProfile(tagM[1]);
      if (typeof window.initNav === "function") window.initNav("home");
      return;
    }

    // Known Phase 2 placeholder routes
    var info = PAGE_INFO[path] || PAGE_INFO[path.replace(/\/$/, "")];
    if (info) {
      showView("view-placeholder");
      var titleEl = document.getElementById("placeholder-title");
      var msgEl   = document.getElementById("placeholder-msg");
      if (titleEl) titleEl.textContent = info.title;
      if (msgEl)   msgEl.textContent   = info.msg;
      if (typeof window.initNav === "function") window.initNav(info.nav);
      return;
    }

    // Default: homepage
    showView("view-home");
    if (typeof window.initNav === "function") window.initNav("home");
  }

  document.addEventListener("DOMContentLoaded", boot);

}());
