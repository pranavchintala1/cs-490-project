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

  upload(data){
    return api.post(`${BASE_URL}/upload`, data);
  }

  // PUT update an existing cover letter
  update(coverLetterId, data) {
    return api.put(`${BASE_URL}/${coverLetterId}`, data);
  }

  // DELETE a cover letter
  delete(coverLetterId) {
    return api.delete(`${BASE_URL}/${coverLetterId}`);
  }

  // GET usage stats aggregated by template type
  getUsageByType() {
    return api.get(`${BASE_URL}/usage/by-type`);
  }
}

export default new CoverLetterAPI();