
import { getApiBaseUrl, getApiClient } from "./serviceconfig";

var apiBaseUrl = getApiBaseUrl();
export async function getAllProducts(cookies) {

    return getApiClient(cookies)
    .get(`${apiBaseUrl}/products/`)
    .then(response => response.data);
}

export async function createProducts(cookies, inputs) {

  return getApiClient(cookies).post(`${apiBaseUrl}/products/`,inputs)
  
}

export async function updateProducts(cookies, inputs, product_id) {

    return getApiClient(cookies)
    .put(`${apiBaseUrl}/products/${product_id}/`,inputs)
}
  


export async function getProductDetails(cookies, product_id) {

  return getApiClient(cookies).get(`${apiBaseUrl}/products/${product_id}/`)
  .then(response => response.data)
}

export async function deleteProducts(cookies, product_id) {

  return getApiClient(cookies).delete(
    `${apiBaseUrl}/products/${product_id}/`)
   
}