import api from "./base";

const BASE_URL = "/users";

class ProfilesAPI { // we don't require uuid as a query param, since it is now a header for privacy and easy auth
    get() {
        return api.get(`${BASE_URL}/me`);
    }

    update(data) {
        return api.put(`${BASE_URL}/me`, data);
    }

    deleteAllData(passBody) { // should just contain the password field in the json body
        return api.post(`${BASE_URL}/me`, passBody);
    }

    uploadAvatar(image) {
        const formData = new FormData();
        formData.append("image", image);
        return api.post(`${BASE_URL}/me/avatar`, formData);
    }

    getAvatar() {
        return api.get(`${BASE_URL}/me/avatar`, {responseType: "blob"});
    }

    updateAvatar(avatarId, image) {
        const formData = new FormData();
        formData.append("image", image);
        return api.put(`${BASE_URL}/me/avatar?media_id=${avatarId}`, formData);
    }

    deleteAvatar(avatarId) {
        return api.delete(`${BASE_URL}/me/avatar?media_id=${avatarId}`);
    }
}

export default new ProfilesAPI();