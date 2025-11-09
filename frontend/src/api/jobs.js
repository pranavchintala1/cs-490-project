import api from "./base";

const BASE_URL = "/jobs";

class JobsAPI {
    add(data) {
        return api.post(BASE_URL, data);
    }

    get(jobId) {
        return api.get(`${BASE_URL}?job_id=${jobId}`);
    }

    getAll() {
        return api.get(`${BASE_URL}/me`);
    }

    update(jobId, data) {
        return api.put(`${BASE_URL}?job_id=${jobId}`, data);
    }

    delete(jobId) {
        return api.delete(`${BASE_URL}?job_id=${jobId}`);
    }
}

export default new JobsAPI();