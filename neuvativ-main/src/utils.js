const utils = {
    /**
     * Does not mutate original array.
     * Deletes specified element from array and returns new array.
     * Useful for small arrays, probably not performant. 
     * @param {Array} array
     * @param {number} i - index of element to delete 
     * @returns 
     */
    removeItem: (array, i) =>
      array.slice(0, i).concat(array.slice(i + 1, array.length)),
  
    /**
     * Does not mutate original array.
     * Adds specified element to array and returns new one.
     * @param {*} array 
     * @param {*} element 
     * @returns 
     */
    addItem: (array, element) => array.concat([element]),
  
    /**
       * Sorting projects by project Id
       */
     compareProjectIds: ( a, b, typeOfSort ) => {
      if(typeOfSort === "projectId"){
          if ( a.projectId < b.projectId ){
          return -1;
          }
          if ( a.projectId > b.projectId ){
          return 1;
          }
          return 0;
      }
      if(typeOfSort === "userName"){
          if ( a.preferred_username < b.preferred_username ){
          return -1;
          }
          if ( a.preferred_username > b.preferred_username ){
          return 1;
          }
          return 0;
      }
    }
    
  
    
  
  };
  
  export default utils;