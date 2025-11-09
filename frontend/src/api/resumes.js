import api from "./base";

const BASE_URL = "/resumes";

class ResumesAPI {
    add(data) {
        return api.post(BASE_URL, data);
    }

    get(resumeId) {
        return api.get(`${BASE_URL}?resume_id=${resumeId}`);
    }

    getAll() {
        return api.get(`${BASE_URL}/me`);
    }

    update(resumeId, data) {
        return api.put(`${BASE_URL}?resume_id=${resumeId}`, data);
    }

    delete(resumeId) {
        return api.delete(`${BASE_URL}?resume_id=${resumeId}`);
    }
}

export default new ResumesAPI();