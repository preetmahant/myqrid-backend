python3 << 'ENDOFFILE'
import base64

def b64(path):
    with open(path,'rb') as f:
        return base64.b64encode(f.read()).decode()

a = 'public/assets'
dark_b64  = b64(f'{a}/myqrid-logo-for-dark-bg.svg')
light_b64 = b64(f'{a}/myqrid-logo-for-light-bg.svg')
icon_b64  = b64(f'{a}/myqrid-icon.svg')
qrd_b64   = b64(f'{a}/myqrid-qr-for-dark-bg.svg')
qrl_b64   = b64(f'{a}/myqrid-qr-for-light-bg.svg')
q_b64     = b64(f'{a}/myqrid-q-gradient.svg')

logo_js = f'''// myQRID Logo System — FROZEN MASTER
const MYQRID_LOGO_DARK  = "data:image/svg+xml;base64,{dark_b64}";
const MYQRID_LOGO_LIGHT = "data:image/svg+xml;base64,{light_b64}";
const MYQRID_ICON       = "data:image/svg+xml;base64,{icon_b64}";
const MYQRID_QR_DARK    = "data:image/svg+xml;base64,{qrd_b64}";
const MYQRID_QR_LIGHT   = "data:image/svg+xml;base64,{qrl_b64}";
const MYQRID_Q          = "data:image/svg+xml;base64,{q_b64}";
const MYQRID_LOGO       = MYQRID_LOGO_DARK;

function injectLogos() {{
  document.querySelectorAll('img[id*="logo"],img[id*="Logo"],img[id*="splash"]').forEach(el => {{
    if (!el.src || el.src === window.location.href || el.src.endsWith('/')) {{
      el.src = MYQRID_LOGO_DARK;
      el.alt = el.alt || 'myQRID';
    }}
  }});
  document.querySelectorAll('img[id*="nav-logo"],img[data-logo="icon"]').forEach(el => {{
    el.src = MYQRID_ICON;
    el.alt = 'myQRID';
  }});
  document.querySelectorAll('img[data-logo="qr"]').forEach(el => {{
    el.src = MYQRID_QR_DARK;
  }});
  const fav = document.querySelector('link[rel*="icon"]');
  if (fav) fav.href = MYQRID_ICON;
}}

document.addEventListener('DOMContentLoaded', injectLogos);
'''

with open('public/js/logo.js','w') as f:
    f.write(logo_js)

print(f"✅ logo.js: {len(logo_js):,} bytes")
ENDOFFILE
