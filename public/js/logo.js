const MYQRID_LOGO = '/assets/myqrid-logo.png';
function setLogo(id, size) {
  const el = document.getElementById(id);
  if (!el) return;
  el.src = MYQRID_LOGO;
  if (size) { el.width = size; el.height = size; }
}
