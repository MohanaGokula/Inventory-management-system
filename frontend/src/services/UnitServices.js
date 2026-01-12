
import { getApiBaseUrl,getApiClient } from "./serviceconfig";

var apiBaseUrl = getApiBaseUrl();

export async function getAllUnits(cookies,searchString) {

    // setTimeout(5000, () => {
    //   console.log('Waiting....');
      
    // });

    let url= `${apiBaseUrl}/unit/`;
    if (searchString) {
      url = url + `?name=${searchString}`;
    }
   return getApiClient(cookies).get(url)
    .then(response => response.data);
    
              // .then((data) => {
              //   return data;
              // });
}

export function createUnit(cookies, inputs) {

  
 return getApiClient(cookies).post(`${apiBaseUrl}/unit/`, inputs)
   
}

export function updateUnit(cookies, inputs, unitId) {

  return getApiClient(cookies).put(`${apiBaseUrl}/unit/${unitId}/`,inputs)

  
}

export async function getUnitDetails(cookies, unitId) {

  return getApiClient(cookies).get(`${apiBaseUrl}/unit/${unitId}/`)
              .then(response => response.data)
}

export function deleteUnit(cookies, unitId) {

  return getApiClient(cookies).delete(`${apiBaseUrl}/unit/${unitId}/`)
}