import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:5000",
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    window.location.href = "/";
    return Promise.reject(err);
  }
);

export default api;