// src/tools/api.js
// 👇 Re-export everything from the legacy root API so nothing is lost.
export * from "../api";

// --- Non-breaking profile helpers used by profile.jsx ---

const BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

// Accept both new and legacy auth keys so this is drop-in safe.
function auth() {
  const uuid = localStorage.getItem("uuid") ?? localStorage.getItem("user_id");
  const token = localStorage.getItem("token") ?? localStorage.getItem("session");
  return { uuid, token };
}

// Generic fetch that **does not** force JSON headers on FormData.
async function http(method, path, { params, headers = {}, body } = {}) {
  const url = new URL(path, BASE_URL);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const h = { ...headers };
  let payload = body;

  // Only set JSON header when NOT sending FormData (browser must set boundary)
  if (body && !(body instanceof FormData)) {
    h["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(url.toString(), { method, headers: h, body: payload });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `${res.status} ${res.statusText}`);
  return text ? JSON.parse(text) : null;
}

/**
 * GET /api/users/me?uuid=...
 * Uses Authorization: Bearer <token>
 */
export const getMe = async () => {
  const { uuid, token } = auth();
  if (!uuid || !token) throw new Error("Not authenticated");
  return http("GET", "/api/users/me", {
    params: { uuid },
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * PUT /api/users/me (multipart)
 * Fields:
 *   - profile: JSON string of the profile object
 *   - pfp: optional File (image)
 *
 * This matches your existing FastAPI handler that takes
 *   profile: ProfileSchema, pfp: UploadFile | None
 */
export const updateMe = async (profileObj, file /* File | null */) => {
  const { uuid, token } = auth();
  if (!uuid || !token) throw new Error("Not authenticated");

  const fd = new FormData();
  fd.append("profile", JSON.stringify(profileObj));   // MUST match backend param name
  if (file) fd.append("pfp", file);                   // MUST match backend param name

  return http("PUT", "/api/users/me", {
    params: { uuid },
    headers: { Authorization: `Bearer ${token}` },   // no Content-Type here
    body: fd,
  });
};

/**
 * Convert the returned picture bytes (base64) into a data URL for <img src=...>
 * Assumes backend returns the bytes on profile.profile_picture (as shown in Swagger schema).
 */
export const profileImageDataUrl = (profile) => {
  const b64 = profile?.profile_picture;
  return b64 ? `data:image/*;base64,${b64}` : null;
};
