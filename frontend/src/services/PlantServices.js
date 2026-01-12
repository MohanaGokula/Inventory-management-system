import { getApiBaseUrl, getApiClient } from "./serviceconfig";

var apiBaseUrl = getApiBaseUrl();

export async function getAllPlants(cookies,searchString) {

  let url= `${apiBaseUrl}/entity_plant/`;
  if (searchString) {
    url = url + `?name=${searchString}`;
  }
    return getApiClient(cookies).get(url)
      .then(response => response.data);
}

export async function getUserAllowedPlants(cookies) {

  let url= `${apiBaseUrl}/entity_plant/user_allowed`;
    return getApiClient(cookies).get(url)
      .then(response => response.data);
}

export async function createPlant(cookies, inputs) {

  return getApiClient(cookies)
  .post(`${apiBaseUrl}/entity_plant/`, inputs, {
    headers: {
      "Content-Type": "multipart/form-data",
  }});
  
  }

export function updatePlant(cookies, inputs, plantId) {
  
  return getApiClient(cookies)
  .put(`${apiBaseUrl}/entity_plant/${plantId}/`, inputs, {
    headers: {
      "Content-Type": "multipart/form-data",
  }})
}

export async function getPlantDetails(cookies, plantId) {

  return getApiClient(cookies)
  .get(`${apiBaseUrl}/entity_plant/${plantId}/`)
  .then(response => response.data);
}

// export async function getPlantDetails(cookies, companyId) {

//   return getApiClient(cookies).get(`${apiBaseUrl}/entity_plant/${companyId}/companies`)
//         .then((response) => response.data);
// }
export function deletePlant(cookies, plantId) {

  return getApiClient(cookies).delete(`${apiBaseUrl}/entity_plant/${plantId}/`); 
}


