var twitstream = require('../lib/twitstream');

var options = {
  track: ['hockey'],
  auth: {
    token: 'xxxxxxx',
    tokenSecret: 'xxxxxxxxxx',
    consumerKey: 'xxxxxxxxxx',
    consumerSecret: 'xxxxxxxxxxxx'
  }
};

var stream = twitstream(options);

stream.on('readable', function () {
  var tweet = stream.read();
  console.log(JSON.stringify(tweet));
});

stream.on('error', function (err) {
  console.error(err);
});
