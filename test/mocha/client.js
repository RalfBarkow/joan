import joan from '../../src/client/javascript/joan.js';
import sessionless from 'sessionless-node';
import { should } from 'chai';
should();

console.log(joan);

const savedUser = {};
let keys = {};
const hash = 'firstHash';
const secondHash = 'secondHash';

it('should register a user', async () => {
  const uuid = await joan.createUser(hash, (k) => { keys = k; }, () => { return keys; });
  savedUser.uuid = uuid;
  savedUser.uuid.length.should.equal(36);
});

it('should reenter', async () => {
  const user = await joan.reenter(hash, (k) => { keys = k; }, () => { return keys; });
  savedUser = user;
  savedUser.uuid.length.should.equal(36);
});

it('should save hash', async () => {
  const res = await joan.updateHash(savedUser.uuid, hash, secondHash);
  res.should.equal(true);
});

it('should delete a user', async () => {
  const res = await joan.deleteUser(savedUser.uuid, secondHash);
  res.should.equal(true);
});
