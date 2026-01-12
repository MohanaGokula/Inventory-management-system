import axios from "axios";
import { getApiBaseUrl, getApiClient } from "./serviceconfig";

var apiBaseUrl = getApiBaseUrl();

export async function submitLogin(user_name, password,otp,latitude,longitude) {
    return axios.post(`${apiBaseUrl}/login/`, {
                username: user_name.trim(),
                password: password,
                otp : otp,
                latitude:latitude,
                longitude:longitude
              })
            .then(response => {
                return response.data;
            });
}

export async function performLogout(cookies) {

  return getApiClient(cookies).post(`${apiBaseUrl}/logout/`);
}