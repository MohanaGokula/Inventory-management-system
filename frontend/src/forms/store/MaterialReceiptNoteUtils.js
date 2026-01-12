import {getAllSalesRepresentatives} from '../../services/SalesRepresentativeServices'

export function checkForDuplicateMaterialReceiptNotes(name, value, cookies, existingId) {
    
    
    let nameCheck = new Promise((resolve, reject) => {
      getAllMaterialReceiptNotes(cookies)
      .then((data) => {

        let isUserExists = false;
        for(var i=0; i<data.salesrep_data.length; i++)    //Same Sales Representative Name mentioned it denoted already exist.
        {
          if((data.salesrep_data[i].entity_name) === value.trim().toUpperCase()
            && parseInt(existingId) !== data.salesrep_data[i].id){   
            
            console.log(`User exists with the name - ${value}`) 
            isUserExists = true;
            break;
          }
        }
        resolve(isUserExists);
      });  
    });

    return nameCheck;
  }