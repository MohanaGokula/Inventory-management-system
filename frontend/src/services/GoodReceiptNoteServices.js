import axios from "axios";
// import { getApiBaseUrl } from "./serviceconfig";
import { getApiBaseUrl, getApiClient } from "./serviceconfig";

var apiBaseUrl = getApiBaseUrl();

// export async function getGoodsReceiptnumber(cookies, plant_id, grn_date) {
//   let url = `${apiBaseUrl}/goods_receipt_notes/goods_receipt_number/?plant_id=${plant_id}&grn_date=${grn_date}`;
  
//   return getApiClient(cookies).get(url)
//       .then(response => response.data);

// }
export async function getGoodsReceiptnumber(cookies, plant_id, grn_date) {
    let url = `${apiBaseUrl}/goods_receipt_notes/goods_receipt_number/?plant_id=${plant_id}&grn_date=${grn_date}`;
  
    return getApiClient(cookies).get(url)
        .then(response => response.data);
} 

export async function getpurchaseorderforgrn (cookies) {
    return getApiClient(cookies).get(`${apiBaseUrl}/purchase_orders/goods_receipt_note/`)
      .then(response => response.data);
  }

  export async function getAllGoodsReceiptNotes(cookies) {
    return getApiClient(cookies).get(`${apiBaseUrl}/goods_receipt_notes/`)
      .then(response => response.data);
   
  }