(function () {
  function getToastEl() {
    var el = document.getElementById("mvp-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "mvp-toast";
      el.className = "mvp-toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    return el;
  }

  function showToast(msg, duration) {
    var el = getToastEl();
    el.textContent = msg;
    el.classList.add("mvp-toast--show");
    clearTimeout(el._timer);
    el._timer = setTimeout(function () {
      el.classList.remove("mvp-toast--show");
    }, duration || 1800);
  }

  window.showToast = showToast;
}());
