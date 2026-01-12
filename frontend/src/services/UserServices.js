
import { getApiBaseUrl, getApiClient } from "./serviceconfig";

var apiBaseUrl = getApiBaseUrl();
export async function getAllUsers(cookies) {

    return getApiClient(cookies)
    .get(`${apiBaseUrl}/user/`)
    .then(response => response.data);
}

export async function createUser(cookies, inputs) {

  return getApiClient(cookies).post(`${apiBaseUrl}/user/`,inputs)
  
}

export async function updateUser(cookies, inputs, userId) {

    return getApiClient(cookies)
    .put(`${apiBaseUrl}/user/${userId}/`, inputs)
}
  


export async function getUserDetails(cookies, userId) {

  return getApiClient(cookies).get(`${apiBaseUrl}/user/${userId}/`)
  .then(response => response.data)
}

export async function deleteUser(cookies, userId) {

  return getApiClient(cookies).delete(
    `${apiBaseUrl}/user/${userId}/`)
   
}