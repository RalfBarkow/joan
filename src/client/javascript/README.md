# Joan

This is the JavaScript client SDK for the Joan miniservice. 

### Usage

```javascript
import joan from 'joan-js';

const saveKeys = (keys) => { /* handle persisting keys here */ };
const getKeys = () => { /* return keys here. Can be async */ };

const email = 'foo@bar.com';
const password = 'password';
const credentialsHash = yourHashingFunction(email + password);

const uuid = await joan.createUser(credentialsHash, saveKeys, getKeys);

const user = await joan.reenter(credentialsHash, saveKeys, getKeys); 

const newPassword = 'newPassword';
const newHash = yourHashingFunction(email + newPassword);

const userAgain = await joan.updateHash(uuid, credentialsHash, newHash); 

const deleted = await joan.deleteUser(uuid, newHash); // returns true on success
```
