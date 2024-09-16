import config from './config/local.js';
import express from 'express';
import cors from 'cors';
import user from './src/user/user.js';
import MAGIC from './src/magic/magic.js';
import sessionless from 'sessionless-node';

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const requestTime = +req.query.timestamp || +req.body.timestamp;
  const now = new Date().getTime();
  if(Math.abs(now - requestTime) > config.allowedTimeDifference) {
    return res.send({error: 'no time like the present'});
  }
  next();
});

app.put('/user/create', async (req, res) => {
  try {
    const body = req.body;
console.log(body);
    const pubKey = body.pubKey;
    const hash = body.hash;
    const message = body.timestamp + hash + pubKey;

    const signature = req.body.signature;
   
    if(!signature || !sessionless.verifySignature(signature, message, pubKey)) {
console.log("auth error");
      res.status(403);
      return res.send({error: 'auth error'});
    }
console.log('putting user');
    const userToPut = {
      pubKey,
      hash
    };

    const foundUser = await user.putUser(userToPut);
console.log(foundUser);
    res.send(foundUser);
  } catch(err) {
    res.status(404);
    res.send({ error: 'Not Found' });
  }
});

app.get('/user/:hash/pubKey/:pubKey', async (req, res) => {
  try {
    const hash = req.params.hash;
    const pubKey = req.params.pubKey;
    const timestamp = req.query.timestamp;
    const signature = req.query.signature;
    const message = timestamp + hash;
   
    const foundUser = await user.getUser(hash);

    if(!signature || !sessionless.verifySignature(signature, message, pubKey)) {
      res.status(403);
      return res.send({error: 'auth error'});
    }

    foundUser.pubKey = pubKey;
    await user.saveUser(foundUser);

    res.send(foundUser);
  } catch(err) {
    res.status(404);
    res.send({ error: 'Not Found' });
  }
});

app.put('/user/:uuid/update-hash', async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const body = req.body;
    const timestamp = body.timestamp;
    const hash = body.hash;
    const newHash = body.newHash;
    const signature = body.signature;
    const message = timestamp + uuid + hash + newHash;

    const foundUser = await user.getUser(hash);

    if(!signature || !sessionless.verifySignature(signature, message, foundUser.pubKey)) {
      res.status(403);
      return res.send({error: 'auth error'});
    }

    const updatedUser = await user.updateHash(hash, newHash);

    res.status(202);
    res.send(updatedUser);
  } catch(err) {
    res.status(404);
    res.send({ error: 'Not Found' });
  }
});

app.post('/magic/spell/:spellName', async (req, res) => {
  try {
    const spellName = req.params.spell;
    const spell = req.body.spell;
    
    switch(spellName) {
      case 'joinup': const resp = await MAGIC.joinup(spell);
        return res.send(resp);
        break;
      case 'linkup': const resp = await MAGIC.linkup(spell);
        return res.send(resp);
        break;
    }
  
    res.status(404);
    res.send({error: 'spell not found'});
  } catch(err) {
    res.status(404);
    res.send({error: 'not found'});
  }
});

app.delete('/user/:uuid', async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const body = req.body;

console.log(body);
    const timestamp = body.timestamp;
    const hash = body.hash;
    const signature = body.signature;
    const message = timestamp + uuid + hash;
console.log("vars consted");

    const foundUser = await user.getUser(hash);

    if(!signature || !sessionless.verifySignature(signature, message, foundUser.pubKey)) {
      res.status(403);
      return res.send({error: 'auth error'});
    }
console.log('about to delete');
    const success = await user.deleteUser(hash);
console.log('success: ', success);
    res.send({ success });
  } catch(err) {
console.warn(err);
    res.status(404);
    res.send({ error: 'Not Found' });
  }
});

app.listen(3004);

console.log('server listening for credentials on port 3004');
