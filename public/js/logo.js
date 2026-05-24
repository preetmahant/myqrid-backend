const MYQRID_LOGO_DARK = '/assets/myqrid-logo-for-dark-bg.svg';
const MYQRID_LOGO_LIGHT = '/assets/myqrid-logo-for-light-bg.svg';
const MYQRID_ICON = '/assets/myqrid-icon.svg';
const MYQRID_Q = '/assets/myqrid-q-gradient.svg';
const MYQRID_LOGO = MYQRID_LOGO_DARK;

function injectLogos() {
  document.querySelectorAll('img[id*="logo"],img[id*="Logo"],img[id*="splash"]').forEach(el => {
    el.src = MYQRID_LOGO_DARK;
    el.alt = el.alt || 'myQRID';
  });
  document.querySelectorAll('img[id*="nav-logo"],img[data-logo="icon"]').forEach(el => {
    el.src = MYQRID_ICON;
    el.alt = 'myQRID';
  });
  const fav = document.querySelector('link[rel*="icon"]');
  if (fav) fav.href = MYQRID_ICON;
}

document.addEventListener('DOMContentLoaded', injectLogos);
