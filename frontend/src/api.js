// src/api.js
export async function apiRequest(endpoint, options = {}) {
  const baseURL = "http://localhost:8000"; // TODO replace with actual url
  const uuid = localStorage.getItem("uuid");
  const token = localStorage.getItem("session");

  // attach default headers
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = `${baseURL}/${endpoint}`;
  const config = { ...options, headers };

  try {
    const response = await fetch(url, config);

    // Redirect if unauthorized
    if (response.status === 401 || response.status === 403) {
      localStorage.clear();
      window.location.href = "/login";
      return;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}
