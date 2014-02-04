# twitstream
Twitter streaming module which *I* like.

## Usage

### Creating a client
Create a client tracking `hockey` search term anywhere on twitter.
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

Alternatively you can create a client to track a specific user's twitter stream.
```js
var twitstream = require('twitstream');
var stream = twitstream.Userstream({
  auth: {
    token: '...',
    tokenSecret: '...',
    consumerKey: '...',
    consumerSecret: '...'
  },
  with: 'followings',
  replies: 'all'
});
```

### Read tweets
```js
stream.on('readable', function () {
  var tweet = stream.read();
  console.log(JSON.stringify(tweet));
});
```