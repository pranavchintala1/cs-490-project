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

    importFromUrl(url) {
        return api.post(`${BASE_URL}/import`, {url});
    }

    sendDeadlineReminder(reminderData) {
        return api.post(`${BASE_URL}/send-deadline-reminder`, reminderData);
    }

    scheduleReminders() {
        return api.post(`${BASE_URL}/schedule-reminders`);
    }

    uploadCompanyImage(jobId, file) {
        const formData = new FormData();
        formData.append("media", file);
        return api.post(`${BASE_URL}/upload-company-image?job_id=${jobId}`);
    }

    downloadCompanyImage(jobId) {
        return api.post(`${BASE_URL}/upload-company-image?job_id=${jobId}`);
    }
}

export default new JobsAPI();