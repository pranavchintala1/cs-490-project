import api from "./base"

const BASE_URL = "/certifications"

class CertificationsAPI {
    add(data) {
        return api.post(BASE_URL, data)
            .catch((err) => {console.log(err)});
    }

    get(certification_id) {
        return api.get(`${BASE_URL}?certification_id=${certification_id}`)
            .catch(err => console.log(err));
    }

    getAll() {
        return api.get(`${BASE_URL}/me`)
            .catch(err => console.log(err));
    }

    update(certification_id, data) {
        return api.put(`${BASE_URL}?certification_id=${certification_id}`, data)
            .catch(err => console.log(err));
    }

    delete(certification_id) {
        return api.delete(`${BASE_URL}?certification_id=${certification_id}`)
            .catch(err => console.log(err));
    }

    upload_media(file) {
        const formData = new FormData();
        formData.append("media", file);
        return api.post(`${BASE_URL}/media`, formData)
            .catch(err => console.log(err));
    }

    retrieve_media(media_id, download) { 
        // "download" determines whether to immediately download the file or send it as displayable url
        const res = api.get(`${BASE_URL}/media`, {params: {download, media_id}, responseType: "blob"})
            .catch(err => console.log(err))

        if (!download) {
            const url = URL.createObjectURL(res.data);
            return url;
        } else {
            return res;
        }
    }

    update_media(media_id, file) {
        return api.get(`${BASE_URL}/media?media_id=${media_id}`, file)
            .catch(err => console.log(err));
    }

    delete_media(media_id) {
        return api.get(`${BASE_URL}/media?media_id=${media_id}`)
            .catch(err => console.log(err))
    }
}

export default new CertificationsAPI();