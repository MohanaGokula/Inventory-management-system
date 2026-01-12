
import { getApiBaseUrl, getApiClient } from "./serviceconfig";

var apiBaseUrl = getApiBaseUrl();
export async function getAllTax(cookies,searchString) {

  let url= `${apiBaseUrl}/tax/`;
  if (searchString) {
    url = url + `?name=${searchString}`;
  }
    return getApiClient(cookies).get(url)
      .then(response => response.data);
}
export async function createTax(cookies, inputs) {

  return getApiClient(cookies).post(`${apiBaseUrl}/tax/`,inputs)
  
}

export async function updateTax(cookies, inputs, taxId) {

    return getApiClient(cookies)
    .put(`${apiBaseUrl}/tax/${taxId}/`,inputs)
}
  


export async function getTaxDetails(cookies, taxId) {

  return getApiClient(cookies).get(`${apiBaseUrl}/tax/${taxId}/`)
  .then(response => response.data)
}

export async function deleteTax(cookies, taxId) {

  return getApiClient(cookies).delete(
    `${apiBaseUrl}/tax/${taxId}/`)
   
}