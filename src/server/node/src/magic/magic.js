import sessionless from 'sessionless-node';
import user from '../user/user.js';
import db from '../persistence/db.js';

sessionless.getKeys = async () => {
  return await db.getKeys();
};

const fountURL = 'http://localhost:3006/';

const MAGIC = {
  joinup: async (spell) => {
    const gateway = await gatewayForSpell(spell.spellName);
    spell.gateways.push(spell);

    const res = await MAGIC.forwardSpell(spell, fountURL);
    const body = await res.json();
 
    if(!body.success) {
      return body;
    }

    const foundUser = await user.putUser(spell.user);
    if(!body.uuids) {
      body.uuids = [];
    }
    body.uuids.push({
      service: 'joan',
      uuid: foundUser.uuid
    });

    return body;
  },

  linkup: async (spell) => {
    const foundUser = await user.getUser(spell.casterUUID);

    if(coordinatingKeys.filter(keys => keys).length !== spell.gateways.length) {
      throw new Error('missing coordinating key');
    }

    const gateway = await gatewayForSpell(spell.spellName);
    gateway.coordinatingKey = {
      serviceURL: 'http://localhost:3004/', // Once hedy is built, this will be dynamic
      uuid: spell.casterUUID,
      pubKey: foundUser.pubKey
    };
    spell.gateways.push(gateway);

    const res = await MAGIC.forwardSpell(spell, fountURL);
    const body = await res.json();
    return body;
  },

  gatewayForSpell: async (spellName) => {
    const joan = await db.getUser('joan');
    const gateway = {
      timestamp = new Date().getTime() + '',
      uuid: joan.uuid, 
      minimumCost: 20,
      ordinal: joan.ordinal
    };      

    const message = gateway.timestamp + gateway.uuid + gateway.minimumCost + gateway.ordinal;

    gateway.signature = await sessionless.sign(message);

    return gateway;
  },

  forwardSpell: async (spell, destination) => {
    return await fetch(destination, {
      method: 'post',
      body: JSON.stringify(spell),
      headers: {'Content-Type': 'application/json'}
    });
  }
};

export default MAGIC;
