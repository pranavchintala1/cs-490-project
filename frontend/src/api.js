const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export async function getUserProfile(userId) {
  const response = await fetch(`${API_URL}/profile/me?user_id=${userId}`);
  return response.json();
}

export async function updateUserProfile(userId, data) {
  const response = await fetch(`${API_URL}/profile/me?user_id=${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function uploadProfilePicture(userId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/profile/upload-profile-picture?user_id=${userId}`, {
    method: "POST",
    body: formData,
  });

  return response.json();
}
