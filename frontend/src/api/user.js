import api from "./base";

const BASE_URL = "/user";

class UserAPI {
  // Fetch all user data for the current user
  getAllData() {
    return api.get(`${BASE_URL}/me/all_data`);
  }

  // If you want, you can add more user endpoints here later...
}

export default new UserAPI();
