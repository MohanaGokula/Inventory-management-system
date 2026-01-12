import { getApiBaseUrl, getApiClient } from "./serviceconfig";

var apiBaseUrl = getApiBaseUrl();

export async function getAllCompanies(cookies,searchString) {

  let url= `${apiBaseUrl}/entity_company/`;
  if (searchString) {
    url = url + `?name=${searchString}`;
  }
    return getApiClient(cookies).get(url)
      .then(response => response.data);
}

export async function createCompany(cookies, inputs) {

  return getApiClient(cookies).post(`${apiBaseUrl}/entity_company/`, inputs, {
    headers: {
      "Content-Type": "multipart/form-data",
  }});
  
  }

export function updateCompany(cookies, inputs, companyId) {
  
  return getApiClient(cookies)
  .put(`${apiBaseUrl}/entity_company/${companyId}/`, inputs, {
    headers: {
      "Content-Type": "multipart/form-data",
  }})
}

export async function getCompanyDetails(cookies, companyId) {

  return getApiClient(cookies)
  .get(`${apiBaseUrl}/entity_company/${companyId}/`)
  .then(response => response.data);
}

// export async function getPlantDetails(cookies, companyId) {

//   return getApiClient(cookies).get(`${apiBaseUrl}/entity_plant/${companyId}/companies`)
//         .then((response) => response.data);
// }
export function deleteCompany(cookies, companyId) {

  return getApiClient(cookies).delete(`${apiBaseUrl}/entity_company/${companyId}/`); 
}

