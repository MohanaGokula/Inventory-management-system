
import { getApiBaseUrl, getApiClient } from "./serviceconfig";

var apiBaseUrl = getApiBaseUrl();
export async function getAllGroups(cookies,searchString) {

  let url= `${apiBaseUrl}/accounting_master/`;
  if (searchString) {
    url = url + `?name=${searchString}`;
  }
    return getApiClient(cookies).get(url)
      .then(response => response.data);
}

export async function createGroup(cookies, inputs) {


  return getApiClient(cookies).post(`${apiBaseUrl}/accounting_master/`,inputs)
  
}

export async function updateGroup(cookies, inputs, groupId) {
  console.log(cookies+"cookies")

    return getApiClient(cookies)
    .put(`${apiBaseUrl}/accounting_master/${groupId}/`,inputs)
}
  


export async function getGroupDetails(cookies, groupId) {

  return getApiClient(cookies).get(`${apiBaseUrl}/accounting_master/${groupId}/`)
  .then(response => response.data)
}

export async function deleteGroup(cookies, groupId) {

  return getApiClient(cookies).delete(
    `${apiBaseUrl}/accounting_master/${groupId}/`)
   
}