
import { getApiBaseUrl, getApiClient } from "./serviceconfig";

var apiBaseUrl = getApiBaseUrl();

export async function getAllEquipments(cookies,searchString) {

  let url= `${apiBaseUrl}/equipments/`;
  if (searchString) {
    url = url + `?name=${searchString}`;
  }
    return getApiClient(cookies).get(url)
      .then(response => response.data);
}

export async function createEquipments(cookies, inputs) {

  return getApiClient(cookies).post(`${apiBaseUrl}/equipments/`,inputs)
  
}

export async function updateEquipments(cookies, inputs, equipment_id) {

    return getApiClient(cookies)
    .put(`${apiBaseUrl}/equipments/${equipment_id}/`,inputs)
}
  


export async function getEquipmentsDetails(cookies, equipment_id) {

  return getApiClient(cookies).get(`${apiBaseUrl}/equipments/${equipment_id}/`)
  .then(response => response.data)
}

export async function deleteEquipments(cookies, equipment_id) {

  return getApiClient(cookies).delete(
    `${apiBaseUrl}/equipments/${equipment_id}/`)
   
}