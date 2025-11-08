
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

  // Update profile data
  await http("PUT", "/api/users/me", {
    params: { uuid },
    headers: { Authorization: `Bearer ${token}` },
    body: profileObj,
  });

  // If file is provided, upload as avatar and return the image_id
  let imageId = null;
  if (file) {
    const uploadResponse = await uploadAvatar(file);
    imageId = uploadResponse?.image_id;
  }

  return { detail: "Profile updated successfully", image_id: imageId };
};

export const uploadAvatar = async (file /* File */) => {
  const { uuid, token } = auth();
  if (!uuid || !token) throw new Error("Not authenticated");

  const formData = new FormData();
  formData.append("image", file);

  const url = new URL("/api/users/me/avatar", process.env.REACT_APP_API_URL || "http://127.0.0.1:8000");
  url.searchParams.set("uuid", uuid);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || `${res.status} ${res.statusText}`);
  return text ? JSON.parse(text) : null;
};

export const getAvatarUrl = async () => {
  const { uuid, token } = auth();
  if (!uuid || !token) {
    console.log("No auth credentials for avatar");
    return null;
  }

  try {
    const url = new URL("/api/users/me/avatar", process.env.REACT_APP_API_URL || "http://127.0.0.1:8000");
    url.searchParams.set("uuid", uuid);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.warn("Avatar fetch failed:", res.status, res.statusText);
      return null;
    }

    const blob = await res.blob();
    console.log("Avatar blob received, size:", blob.size);

    if (!blob || blob.size === 0) {
      console.warn("Avatar blob is empty");
      return null;
    }

    const url2 = URL.createObjectURL(blob);
    console.log("Avatar blob URL created successfully");
    return url2;
  } catch (error) {
    console.error("Failed to get avatar:", error);
    return null;
  }
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