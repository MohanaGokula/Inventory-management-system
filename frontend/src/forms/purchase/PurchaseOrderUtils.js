import {getAllPurchaseOrders} from '../../services/PurchaseOrderServices'

export function checkForDuplicatePurchaseOrders(poName, cookies, existingId) {
    
    
    let nameCheck = new Promise((resolve, reject) => {
      getAllPurchaseOrders(cookies)
      .then((data) => {

        let isUserExists = false;
        data.po_data.ForEach(po =>{           //Same Purchase Order mentioned it denoted already exist.
          
            if((po.entity_name) === poName.trim().toUpperCase()
              && parseInt(existingId) !== po.id){   
              
              console.log(`Purchase Order exists with the name - ${poName}`) 
              isUserExists = true;
              
            }
          });
          resolve(isUserExists);
        });  
      });

    return nameCheck;
  }