
import { getApiBaseUrl,getApiClient } from "./serviceconfig";

var apiBaseUrl = getApiBaseUrl();
export async function getAllIPAddress(cookies) {

    return getApiClient(cookies).get (`${apiBaseUrl}/ip/`)
              .then(response => response.data);
}        

export function createIPAddress(cookies, inputs) {
  return getApiClient(cookies).post(`${apiBaseUrl}/ip/`,inputs)
}

export function updateIPAddress(cookies, inputs, ipaddressId) {

  return getApiClient(cookies).put(`${apiBaseUrl}/ip/${ipaddressId}/`,inputs)
    
  .then(response => response.data)
  
}

export async function getIPAddressDetails(cookies, ipaddressId) {

  return getApiClient(cookies).get(`${apiBaseUrl}/ip/${ipaddressId}/`)
              .then(response => response.data)
}

export function deleteIPAddress(cookies, ipaddressId) {

  return getApiClient(cookies).delete(`${apiBaseUrl}/ip/${ipaddressId}/`)
}

export async function validateIpAddress(cookies, ip_address) {

  return getApiClient(cookies)
  .get(`${apiBaseUrl}/ip/validate_ip/?ip_addr=${ip_address}`)
  .then(response => response.data);
}