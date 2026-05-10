(function () {
  var TABS = [
    { id: "home",      label: "Home",      href: "/",          svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>' },
    { id: "profile",   label: "Profile",   href: "/u/me",      svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>' },
    { id: "products",  label: "Products",  href: "/products",  svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>' },
    { id: "analytics", label: "Analytics", href: "/analytics", svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.4-1.4L12 14.2l7.6-7.6L21 8l-9 9z"/></svg>' },
    { id: "rewards",   label: "Rewards",   href: "/rewards",   svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5l-9-4zm0 4l5 2.2V11c0 3.5-2.3 6.8-5 7.9-2.7-1.1-5-4.4-5-7.9V7.2L12 5z"/></svg>' }
  ];

  function initNav(activePage) {
    var container = document.getElementById("bottomNav");
    if (!container) return;

    container.innerHTML = TABS.map(function (tab) {
      var isActive = tab.id === activePage;
      return '<button class="bnav-tab' + (isActive ? " bnav-tab--active" : "") + '"' +
        ' data-href="' + tab.href + '"' +
        ' aria-label="' + tab.label + '">' +
        tab.svg +
        '<span>' + tab.label + '</span>' +
        '</button>';
    }).join("");

    container.querySelectorAll(".bnav-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.location.href = btn.dataset.href;
      });
    });
  }

  window.initNav = initNav;
}());
