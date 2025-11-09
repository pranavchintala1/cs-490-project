import api from "./base";

const BASE_URL = "/resumes";

class ResumesAPI {
    // CORE RESUME OPERATIONS
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

    
    setDefault(resumeId) {
        return api.put(`${BASE_URL}/${resumeId}/set-default`);
    }

    
    createVersion(resumeId, data) {
        return api.post(`${BASE_URL}/${resumeId}/versions`, data);
    }

    getVersions(resumeId) {
        return api.get(`${BASE_URL}/${resumeId}/versions`);
    }

    restoreVersion(resumeId, versionId) {
        return api.post(`${BASE_URL}/${resumeId}/versions/${versionId}/restore`);
    }

    deleteVersion(resumeId, versionId) {
        return api.delete(`${BASE_URL}/${resumeId}/versions/${versionId}`);
    }

    
    addFeedback(resumeId, data) {
        return api.post(`${BASE_URL}/${resumeId}/feedback`, data);
    }

    getFeedback(resumeId) {
        return api.get(`${BASE_URL}/${resumeId}/feedback`);
    }

    updateFeedback(resumeId, feedbackId, data) {
        return api.put(`${BASE_URL}/${resumeId}/feedback/${feedbackId}`, data);
    }

    deleteFeedback(resumeId, feedbackId) {
        return api.delete(`${BASE_URL}/${resumeId}/feedback/${feedbackId}`);
    }

    // RESUME SHARING
    createShareLink(resumeId, data) {
        return api.post(`${BASE_URL}/${resumeId}/share`, data);
    }

    getShareLink(resumeId) {
        return api.get(`${BASE_URL}/${resumeId}/share`);
    }

    revokeShareLink(resumeId) {
        return api.delete(`${BASE_URL}/${resumeId}/share`);
    }

    // PUBLIC: Get shared resume (no auth required)
    getSharedResume(token) {
        return api.get(`${BASE_URL}/public/${token}`);
    }
}

const resumesAPI = new ResumesAPI();
export default resumesAPI;