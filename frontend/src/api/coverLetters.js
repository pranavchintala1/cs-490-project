import api from "./base";

const BASE_URL = "/cover-letters";

class CoverLetterAPI {
  // GET all cover letters for the current user
  getAll(uuid) {
    return api.get(`${BASE_URL}/me/${uuid}`);
  }

  // GET a specific cover letter by ID
  get(coverLetterId) {
    return api.get(`${BASE_URL}/${coverLetterId}`);
  }

  // POST create a new cover letter
  add(data) {
    return api.post(BASE_URL, data);
  }

  // PUT update an existing cover letter
  update(coverLetterId, data) {
    return api.put(`${BASE_URL}/${coverLetterId}`, data);
  }

  // DELETE a cover letter
  delete(coverLetterId) {
    return api.delete(`${BASE_URL}/${coverLetterId}`);
  }
}

export default new CoverLetterAPI();
