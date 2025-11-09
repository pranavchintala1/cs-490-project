import api from "./base"

const BASE_URL = "/cover-letters"

class CoverLetterAPI {
    add(data) {
        return api.post(BASE_URL, data);
    }

    get(coverLetterId) {
        return api.get(`${BASE_URL}?cover_letter_id=${coverLetterId}`);
    }

    getAll() {
        return api.get(`${BASE_URL}/me`);
    }

    update(coverLetterId, data) {
        return api.get(`${BASE_URL}?cover_letter_id=${coverLetterId}`, data);
    }

    delete(coverLetterId) {
        return api.delete(`${BASE_URL}?cover_letter_id=${coverLetterId}`);
    }
}

export default new CoverLetterAPI()