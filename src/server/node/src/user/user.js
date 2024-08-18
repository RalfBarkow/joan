import db from '../persistence/db.js';

const user = {
  getUser: async (hash) => {
    const foundUser = await db.getUser(hash);
    return foundUser;
  }, 

  putUser: async (newUser) => {
    const uuid = await db.putUser(newUser);

    newUser.uuid = uuid; 

    return newUser;
  },

  updateHash: async (oldHash, newHash) => {
    
  },
  
  deleteUser: async (hash) => {
    return (await db.deleteUser(hash));
  }
};

export default user;
