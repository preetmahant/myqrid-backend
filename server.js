// Simple in-memory auth for Cloudflare Worker
const USERS = new Map();

async function handleSignup(request) {
  const body = await request.json();
  const { name, username, email, password, phone } = body;
  if (!name || !username || !email || !password) {
    return Response.json({ success: false, error: 'Missing fields' });
  }
  if (USERS.has(email)) {
    return Response.json({ success: false, error: 'Email already exists' });
  }
  const user = { id: Date.now().toString(), name, username, email, phone, password };
  USERS.set(email, user);
  USERS.set('u_' + username, user);
  const token = btoa(JSON.stringify({ id: user.id, email, username, exp: Date.now() + 7*24*60*60*1000 }));
  return Response.json({ success: true, token, user: { id: user.id, name, username, email, phone } });
}

async function handleLogin(request) {
  const body = await request.json();
  const { email, password } = body;
  const user = USERS.get(email);
  if (!user || user.password !== password) {
    return Response.json({ success: false, error: 'Invalid email or password' });
  }
  const token = btoa(JSON.stringify({ id: user.id, email, username: user.username, exp: Date.now() + 7*24*60*60*1000 }));
  return Response.json({ success: true, token, user: { id: user.id, name: user.name, username: user.username, email } });
}

function getTokenUser(request) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return null;
  try { return JSON.parse(atob(token)); } catch { return null; }
}

async function handleProfile(username) {
  const user = USERS.get('u_' + username);
  if (!user) return Response.json({ success: false, claimed: false, error: 'Not found' });
  return Response.json({ success: true, claimed: true, username: user.username, display_name: user.name, phone: user.phone, mode: 'active' });
}

async function handleDashboard(request) {
  const u = getTokenUser(request);
  if (!u) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  const user = USERS.get(u.email);
  if (!user) return Response.json({ success: false, error: 'User not found' });
  return Response.json({ success: true, profile: { username: user.username, display_name: user.name, email: user.email, phone: user.phone, score: 100, verified: false }, links: [], stats: { total: 0, today: 0, week: 0, recent: [] } });
}

async function handleCheckUsername(username) {
  const taken = USERS.has('u_' + username);
  return Response.json({ available: !taken });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Content-Type': 'application/json'
    };

    if (method === 'OPTIONS') return new Response(null, { headers: cors });

    let response;

    if (path === '/auth/signup' && method === 'POST') response = await handleSignup(request);
    else if (path === '/auth/login' && method === 'POST') response = await handleLogin(request);
    else if (path === '/dashboard' && method === 'GET') response = await handleDashboard(request);
    else if (path.startsWith('/check-username/')) response = await handleCheckUsername(path.split('/')[2]);
    else if (path.startsWith('/profile/') && method === 'GET') response = await handleProfile(path.split('/')[2]);
    else if (path === '/links' && method === 'GET') response = Response.json({ success: true, data: [] });
    else if (path === '/links' && method === 'POST') response = Response.json({ success: true, data: { id: Date.now(), ...await request.json() } });
    else if (path === '/analytics' && method === 'GET') response = Response.json({ success: true, stats: { total: 0, today: 0, week: 0, unique: 0 }, daily: [], devices: [], recent: [] });
    else if (path === '/health') response = Response.json({ status: 'ok', time: new Date().toISOString() });
    else response = Response.json({ success: false, error: 'Not found' }, { status: 404 });

    const headers = new Headers(response.headers);
    Object.entries(cors).forEach(([k,v]) => headers.set(k,v));
    return new Response(response.body, { status: response.status, headers });
  }
};
