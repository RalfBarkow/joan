import config from '../../config/local.js';
import { createClient } from './client.js';
import sessionless from 'sessionless-node';
  
const client = await createClient()
  .on('error', err => console.log('Redis Client Error', err))
  .connect();
    
const db = {
  getUser: async (hash) => {
    const user = await client.get(`user:${hash}`);
    const parsedUser = JSON.parse(user);
    return parsedUser; 
  },

  putUser: async (user) => {
    const uuid = sessionless.generateUUID();
    user.uuid = uuid;
    await client.set(`user:${user.hash}`, JSON.stringify(user));
    const userToReturn = JSON.parse(JSON.stringify(user));
    return userToReturn;
  },

  saveUser: async (user) => {
    await client.set(`user:${user.hash}`, JSON.stringify(user));
    const userToReturn = JSON.parse(JSON.stringify(user));
    return userToReturn;
  },

  updateHash: async (oldHash, newHash) => {
    const user = await db.getUser(oldHash);
    user.hash = newHash;
    const updatedUser = await db.putUser(user);
    await db.deleteUser(oldHash);
    return updatedUser;
  },

  deleteUser: async (hash) => {
    const resp = await client.del(`user:${hash}`);

    return true;
  }

};

export default db;
