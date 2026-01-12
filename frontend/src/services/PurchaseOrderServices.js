import axios from "axios";
// import { getApiBaseUrl } from "./serviceconfig";
import { getApiBaseUrl, getApiClient } from "./serviceconfig";


var apiBaseUrl = getApiBaseUrl();
export async function getAllPurchaseOrders(cookies) {
  let url= `${apiBaseUrl}/purchase_orders/`;
    return getApiClient(cookies).get(url)
      .then(response => response.data);

}

export function createPurchaseOrder(cookies, inputs) {
  return getApiClient(cookies).post(`${apiBaseUrl}/purchase_orders/`, inputs);
}

export async function updatePurchaseOrder(cookies, inputs,  PurchaseOrderId) {

  return getApiClient(cookies)
  .put(`${apiBaseUrl}/purchase_orders/${PurchaseOrderId}/`,inputs)
}

export async function getPurchaseOrderDetails(cookies, purchaseorderId) {

  return getApiClient(cookies).get(`${apiBaseUrl}/purchase_orders/${purchaseorderId}/`)
  .then(response => response.data)
}



export async function deletePurchaseOrder(cookies, purchaseorderId) {

  return getApiClient(cookies).delete(
    `${apiBaseUrl}/purchase_orders/${purchaseorderId}/`)
   
}



export async function getPurchaseOrdernumber(cookies,order_date) {

  let url= `${apiBaseUrl}/purchase_orders/purchase_order_number/`;
  if (order_date) {
    url = url + `?purchase_order_date=${order_date}`;
    
  }
    return getApiClient(cookies).get(url)
      .then(response => response.data);
}


// export async function getpurchaseorderforgrn (cookies, grnId) {
//   return getApiClient(cookies).get(`${apiBaseUrl}/purchase_orders/goods_receipt_note/${grnId}/`)
//     .then(response => response.data);
// }


export async function fetchPDF(cookies,PurchaseOrderId) {

    let url= `${apiBaseUrl}/purchase_orders/71/print_po/`;
    
      return getApiClient(cookies).get(url)
        .then(response => response.data);
  }

