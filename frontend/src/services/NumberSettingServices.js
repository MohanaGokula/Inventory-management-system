
import { getApiBaseUrl, getApiClient } from "./serviceconfig";

var apiBaseUrl = getApiBaseUrl();

export async function getAllNumberSetting(cookies,searchString) {

  let url= `${apiBaseUrl}/number_settings/`;
  if (searchString) {
    url = url + `?name=${searchString}`;
  }
    return getApiClient(cookies).get(url)
      .then(response => response.data);
}

export async function createNumberSetting(cookies, inputs) {

  return getApiClient(cookies).post(`${apiBaseUrl}/number_settings/`,inputs)
  
}

export async function updateNumberSetting(cookies, inputs, numberSettingId) {
console.log(JSON.stringify(inputs)+"updateinputs")
    return getApiClient(cookies)
    .put(`${apiBaseUrl}/number_settings/${numberSettingId}/`,inputs)
}
  


export async function getNumberSettingDetails(cookies, numberSettingId) {

  return getApiClient(cookies).get(`${apiBaseUrl}/number_settings/${numberSettingId}/`)
  .then(response => response.data)
}

export async function deleteNumberSetting(cookies, numberSettingId) {

  return getApiClient(cookies).delete(
    `${apiBaseUrl}/number_settings/${numberSettingId}/`)
   
}