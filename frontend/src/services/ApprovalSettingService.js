
import { getApiBaseUrl,getApiClient } from "./serviceconfig";

var apiBaseUrl = getApiBaseUrl();

export async function getAllApprovalSetting(cookies,searchString) {
  let url= `${apiBaseUrl}/approval_settings/`;
  if (searchString) {
    url = url + `?name=${searchString}`;
  }
 return getApiClient(cookies).get(url)
  .then(response => response.data);
  
    }

export function createApprovalSetting(cookies, inputs) {

  return getApiClient(cookies).post(`${apiBaseUrl}/approval_settings/`, inputs)
}

export function updateApprovalSetting(cookies, inputs, settingId) {
return getApiClient(cookies).put(`${apiBaseUrl}/approval_settings/${settingId}/`,inputs)
}

export async function getApprovalSettingDetails(cookies, settingId) {

  return getApiClient(cookies).get(`${apiBaseUrl}/approval_settings/${settingId}/`)
      
              .then(response => response.data)
}

export function deleteApprovalSetting(cookies, settingId) {

  return getApiClient(cookies).delete(`${apiBaseUrl}/approval_settings/${settingId}/`)
}