import config from './config/local.js';
import express from 'express';
import user from './src/user/user.js';
import sessionless from 'sessionless-node';

const app = express();
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
  const body = req.body;
  const pubKey = body.pubKey;
  const hash = body.hash;
  const message = body.timestamp + hash + pubKey;

  const signature = req.body.signature;
 
  if(!signature || !sessionless.verifySignature(signature, message, pubKey)) {
    res.status(403);
    return res.send({error: 'auth error'});
  }

  const foundUser = await user.putUser(body);
  res.send(foundUser);
});

app.get('/user/:hash', async (req, res) => {
  const hash = req.params.hash;
  const timestamp = req.query.timestamp;
  const signature = req.query.signature;
  const message = timestamp + hash;
 
  const foundUser = await user.getUser(hash);

  if(!signature || !sessionless.verifySignature(signature, message, foundUser.pubKey)) {
    res.status(403);
    return res.send({error: 'auth error'});
  }

  res.send(foundUser);
});

app.put('/user/:uuid/save-hash', async (req, res) => {
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

  res.send(updatedUser);
});

app.delete('user/:uuid', async (req, res) => {
  const uuid = req.params.uuid;
  const body = req.body;
  const timestamp = body.timestamp;
  const hash = body.hash;
  const signature = body.signature;
  const message = timestamp + uuid + hash;

  const foundUser = await user.getUser(hash);

  if(!signature || !sessionless.verifySignature(signature, message, foundUser.pubKey)) {
    res.status(403);
    return res.send({error: 'auth error'});
  }

  const success = await user.deleteUser(hash);

  res.send({ success });
});

app.listen(3004);

console.log('server listening on port 3004');
