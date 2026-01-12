import {getAllGroups} from '../../services/GroupFormServices'

export function checkForDuplicateGroup(name,value, cookies, existingId) {
    
    
    let nameCheck = new Promise((resolve, reject) => {
      getAllGroups(cookies,value)
      .then((data) => {

        let isUserExists = false;
        data.accounts_grouping_list.forEach(group =>{           //Same Group Name mentioned it denoted already exist.
          if((group.entity_name.toUpperCase())=== value.trim().toUpperCase()
          && parseInt(existingId)!==group.id){
            console.log(`group exits with the name - ${value}`)
            isUserExists =true;
          }
        });
        resolve(isUserExists);
      });
    });
    return nameCheck;
  }

  export function getGroupsForCategory(categoryName, cookies) { 

    
    return new Promise((resolve, reject) => {
      getAllGroups(cookies)
      .then((data) => {
        
        let filteredGroups = [];

        const parentGroups = data.accounts_grouping_list
                  .filter(obj => obj.entity_name === categoryName);
        
        if (parentGroups.length > 0) {
          const categoryId = parentGroups[0].id;
          filteredGroups = data.accounts_grouping_list.filter(obj => obj.parent?.id === categoryId )
        }
        
        resolve(filteredGroups);
      });
    });
  }