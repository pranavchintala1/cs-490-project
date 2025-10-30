const BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

function auth() {
  const token = localStorage.getItem("token") || localStorage.getItem("sessionToken");
  const uuid  = localStorage.getItem("uuid")  || localStorage.getItem("userId");
  return { token, uuid };
}

async function http(method, path, { params, body, authz = true } = {}) {
  const url = new URL(path, BASE_URL);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const headers = {};
  if (body) { headers["Content-Type"] = "application/json"; body = JSON.stringify(body); }
  if (authz) { const { token } = auth(); if (token) headers["Authorization"] = `Bearer ${token}`; }

  const res = await fetch(url.toString(), { method, headers, body });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${text}`);
  return text ? JSON.parse(text) : null;
}

/* ---------- shape adapters ---------- */
function toFormShape(doc) {
  return {
    id: doc._id,
    full_name: doc.full_name || "",
    email: doc.email || "",
    phone: doc.phone_number || "",
    location: doc.address || "",
    headline: doc.title || "",
    bio: doc.biography || "",
    experience_level: doc.exp_level || "",
    industry: doc.industry || "",
    date_created: doc.date_created,
    date_updated: doc.date_updated,
  };
}

function toPatchPayload(form) {

  return {
    full_name: form.full_name || null,
    email: form.email || null,
    phone_number: form.phone || "",
    address: form.location || "",
    title: form.headline || "",
    biography: form.bio || "",
    exp_level: form.experience_level || null,
    industry: form.industry || "",
  };
}

/* ---------- API calls ---------- */
// GET /api/users/me?uuid=:uuid
export const getMe = async () => {
  const { uuid } = auth();
  const raw = await http("GET", "/api/users/me", { params: { uuid } });
  return toFormShape(raw);
};

// PUT /api/users/me?uuid=:uuid
export const updateMe = async (formPatch) => {
  const { uuid } = auth();
  const payload = toPatchPayload(formPatch);
  const raw = await http("PUT", "/api/users/me", { params: { uuid }, body: payload });
  return toFormShape(raw);
};
