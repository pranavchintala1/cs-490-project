// src/api.js
const BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

async function http(method, path, { params, body } = {}) {
  const url = new URL(path, BASE_URL);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const init = { method, headers: {}, body: undefined };
  if (body instanceof FormData) {
    init.body = body;
  } else if (body) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  const res = await fetch(url.toString(), init);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${await res.text().catch(()=> "")}`);
  return res.status === 204 ? null : res.json();
}

// ----- PROFILE -----
export const getUserProfile = (userId) =>
  http("GET", "/profile/", { params: { user_id: userId } });

export const createUserProfile = (payload /* must include user_id */) =>
  http("POST", "/profile/", { body: payload });

export const updateUserProfileById = (userId, profileId, payload) =>
  http("PUT", `/profile/${encodeURIComponent(profileId)}/`, { params: { user_id: userId }, body: payload });

export const uploadProfilePicture = (userId, file) => {
  const fd = new FormData();
  fd.append("file", file);
  return http("POST", "/profile/upload-profile-picture", { params: { user_id: userId }, body: fd });
};



export const listJobs   = (userId)               => http("GET",  "/jobs/",               { params: { user_id: userId } });
export const createJob  = (job /* includes user_id */) =>
  http("POST", "/jobs/", { body: job });
export const updateJob  = (userId, id, payload)  => http("PUT",  `/jobs/${id}/`,         { params: { user_id: userId }, body: payload });
export const deleteJob  = (userId, id)           => http("DELETE", `/jobs/${id}/`,       { params: { user_id: userId }});
