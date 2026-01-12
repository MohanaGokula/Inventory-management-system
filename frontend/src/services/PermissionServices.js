
import { getApiBaseUrl, getApiClient } from "./serviceconfig";

var apiBaseUrl = getApiBaseUrl();
export async function getAllPermission(cookies,searchString) {

  let url= `${apiBaseUrl}/groups_and_perms/`;
  if (searchString) {
    url = url + `?name=${searchString}`;
  }
    return getApiClient(cookies).get(url)
      .then(response => response.data);
}

export async function createPermission(cookies, inputs) {

  return getApiClient(cookies).post(`${apiBaseUrl}/groups_and_perms/`,inputs)
  
}

export async function updatePermission(cookies, inputs, permissionId) {

    return getApiClient(cookies)
    .put(`${apiBaseUrl}/groups_and_perms/${permissionId}/`, inputs)
}
  


export async function getPermission(cookies, permissionId) {

  return getApiClient(cookies).get(`${apiBaseUrl}/groups_and_perms/${permissionId}/`)
  .then(response => response.data)
}

export async function deletePermission(cookies, permissionId) {

  return getApiClient(cookies).delete(
    `${apiBaseUrl}/groups_and_perms/${permissionId}/`)
}