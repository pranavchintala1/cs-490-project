
export * from "../api";



const BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";


function auth() {
  const uuid = localStorage.getItem("uuid") ?? localStorage.getItem("user_id");
  const token = localStorage.getItem("token") ?? localStorage.getItem("session");
   return { uuid, token };
}



async function http(method, path, { params, headers = {}, body } = {}) {
  const url = new URL(path, BASE_URL);
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const h = { ...headers };
  let payload = body;
 
    if (body && !(body instanceof FormData)) {
    h["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(url.toString(), { method, headers: h, body: payload });
   const text = await res.text();
  if (!res.ok) throw new Error(text || `${res.status} ${res.statusText}`);
  return text ? JSON.parse(text) : null;
}


export const getMe = async () => {
  const { uuid, token } = auth();
  if (!uuid || !token) throw new Error("Not authenticated");
  return http("GET", "/api/users/me", {
    params: { uuid },
    headers: { Authorization: `Bearer ${token}` },
  });
};


export const updateMe = async (profileObj, file /* File | null */) => {
  const { uuid, token } = auth();
  if (!uuid || !token) throw new Error("Not authenticated");

  // Backend only accepts JSON, not FormData
  // Profile picture upload is not yet implemented
  return http("PUT", "/api/users/me", {
    params: { uuid },
    headers: { Authorization: `Bearer ${token}` },
    body: profileObj,
  });
};


export const profileImageDataUrl = (profile) => {
  const b64 = profile?.profile_picture ?? profile?.profile_image;
  if (!b64) return null;

  
  const mimeType = profile?.image_type || "image/jpeg";
  return `data:${mimeType};base64,${b64}`;
};

export const listEmployment = async () => {
  const { uuid, token } = auth();
  if (!uuid || !token) throw new Error("Not authenticated");

  return http("GET", "/api/employment/me", {
    params: { uuid },
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const createEmployment = async (payload) => {
  const { uuid, token } = auth();
  if (!uuid || !token) throw new Error("Not authenticated");
  return http("POST", "/api/employment", {
    params: { uuid },
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: payload,
  });
};

export const updateEmployment = async (id, payload) => {
   const { uuid, token } = auth();
  if (!uuid || !token) throw new Error("Not authenticated");

  return http("PUT", "/api/employment", {
    params: { uuid, employment_id: id },
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: payload,
  });
};

export const deleteEmployment = async (id) => {
  const { uuid, token } = auth();
  if (!uuid || !token) throw new Error("Not authenticated");

  return http("DELETE", "/api/employment", {
    params: { uuid, employment_id: id },
    headers: { Authorization: `Bearer ${token}` },
  });
};