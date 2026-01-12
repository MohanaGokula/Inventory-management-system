import { getApiBaseUrl,getApiClient } from "./serviceconfig";

var apiBaseUrl = getApiBaseUrl();
export async function getAllVendors(cookies,searchString) {
  let url= `${apiBaseUrl}/vendors/`;
  if (searchString) {
    url = url + `?name=${searchString}`;
  }
    return getApiClient(cookies).get(url)
    .then(response => response.data);
    
           
}

export function createVendor(cookies, inputs) {

  return getApiClient(cookies).post(`${apiBaseUrl}/vendors/`,inputs)
}

export function updateVendor(cookies, inputs, vendorId) {

  return getApiClient(cookies).put (`${apiBaseUrl}/vendors/${vendorId}/`,inputs)
  
}

export async function getVendorDetails(cookies, vendorId) {

  return getApiClient(cookies).get(`${apiBaseUrl}/vendors/${vendorId}/`)
        
              .then(response => response.data)
}

export function deleteVendor(cookies, vendorId) {

  return getApiClient(cookies).delete(`${apiBaseUrl}/vendors/${vendorId}/`)
}