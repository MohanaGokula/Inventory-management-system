
import { getApiBaseUrl, getApiClient } from "./serviceconfig";

var apiBaseUrl = getApiBaseUrl();
export async function getAllQuotations(cookies) {

  let url= `${apiBaseUrl}/quotations/`;
    return getApiClient(cookies).get(url)
      .then(response => response.data);
}



export async function getQuotationNumber(cookies,searchString) {

  let url= `${apiBaseUrl}/quotations/quotation_number/`;
  if (searchString) {
    url = url + `?quotation_date=${searchString}`;
  }
    return getApiClient(cookies).get(url)
      .then(response => response.data);
}

export async function createQuotation(cookies, inputs) {

  return getApiClient(cookies).post(`${apiBaseUrl}/quotations/`,inputs)
  
}

export async function updateQuotation(cookies, inputs, quotationId) {

    return getApiClient(cookies)
    .put(`${apiBaseUrl}/quotations/${quotationId}/`,inputs)
}
  


export async function getQuotationDetails(cookies, quotationId) {

  return getApiClient(cookies).get(`${apiBaseUrl}/quotations/${quotationId}/`)
  .then(response => response.data)
}

export async function deleteQuotation(cookies, quotationId) {

  return getApiClient(cookies).delete(
    `${apiBaseUrl}/quotations/${quotationId}/`)
   
}