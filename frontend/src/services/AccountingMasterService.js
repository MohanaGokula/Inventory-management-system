
import { getApiBaseUrl, getApiClient } from "./serviceconfig";

var apiBaseUrl = getApiBaseUrl();
export async function getAllGroups(cookies) {

    return getApiClient(cookies)
    .get(`${apiBaseUrl}/accounting_master/`)
    .then(response => response.data);
}

export async function createAccountMaster(cookies, inputs) {


  return getApiClient(cookies).post(`${apiBaseUrl}/accounting_master/`,inputs)
  
}

export async function updateAccountMaster(cookies, inputs, groupId) {
  console.log(cookies+"cookies")

    return getApiClient(cookies)
    .put(`${apiBaseUrl}/accounting_master/${groupId}/`,inputs)
}
  


export async function getAccountDetails(cookies, groupId) {

  return getApiClient(cookies).get(`${apiBaseUrl}/accounting_master/${groupId}/`)
  .then(response => response.data)
}

export async function deleteAccountMaster(cookies, groupId) {

  return getApiClient(cookies).delete(
    `${apiBaseUrl}/accounting_master/${groupId}/`)
   
}