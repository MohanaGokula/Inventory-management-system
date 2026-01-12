import axios from "axios";
import { getApiBaseUrl } from "./serviceconfig";

var apiBaseUrl = getApiBaseUrl();
export async function getAllGroups(cookies) {

  return axios.get(`${apiBaseUrl}/accounting_master/`,{headers: {
              'Authorization': `Token ${cookies['myToken']}`
          }})
            .then(response => response.data);
       
}

export function createAccountMaster(cookies,inputs) {

  let responseJson;
  axios.post(`${apiBaseUrl}/accounting_master/`, {
    entity_name: inputs.entity_name,
    entity_type: inputs.entity_type,
    parent_id:((inputs.parent_id === 'primary')?  "": inputs.parent_id)


  
  }, {
    headers: {
      'Authorization': `Token ${cookies['myToken']}`
    }
  }).then(function (response) {
    console.log(response);
    responseJson = response.data;
  }).catch(function (error) {
    console.log(error+"error");
  })

  return responseJson;
}

export function updateAccountMaster(cookies, inputs, groupId) {
  console.log(groupId+"gang")
  console.log(JSON.stringify(cookies)+"cookies")
  console.log(JSON.stringify(inputs)+"inputs")



  axios.put(`${apiBaseUrl}/accounting_master/${groupId}/`,inputs, 
 {
    headers: {
      'Authorization': `Token ${cookies['myToken']}`
    }
  }).then(function (response) {
    console.log(response);
}).catch(function (error) {
    console.log(error+"error");
})
}

export async function getAccountDetails(cookies,groupId) {

  return axios.get(`${apiBaseUrl}/accounting_master/${groupId}/`,{headers: {
              'Authorization': `Token ${cookies['myToken']}`
          }})
            .then(response => response.data);
        }


        export function deleteAccountMaster(cookies, groupFormId) {

          fetch(`${apiBaseUrl}/accounting_master/${groupFormId}/`, { method: 'DELETE',
                    headers: {
                      'Authorization': `Token ${cookies['myToken']}`
                    } }); 
        }