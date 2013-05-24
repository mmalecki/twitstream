# twitstream
Twitter streaming module which *I* like.

## Usage

### Creating a client
Create a client tracking `nodejs` search term.
```js
var twitstream = require('twitstream');
var stream = twitstream({
  auth: {
    token: '...',
    tokenSecret: '...',
    consumerKey: '...',
    consumerSecret: '...'
  },
  track: ['hockey']
});
```

### Read tweets
```js
stream.on('readable', function () {
  var tweet = stream.read();
  console.log(JSON.stringify(tweet));
});
```
