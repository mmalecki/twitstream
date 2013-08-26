var util = require('util'),
    https = require('https'),
    querystring = require('querystring'),
    uuid = require('node-uuid'),
    oauth = require('oauth-sign'),
    ReadableStream = require('stream').Readable;

var Twitstream = function (options) {
  var body = {},
      signature, params, track, follow;

  ReadableStream.call(this, {
    objectMode: true
  });

  params = {
    oauth_version: '1.0',
    oauth_consumer_key: options.auth.consumerKey,
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: uuid().replace(/-/g, ''),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_token: options.auth.token
  };

  if (options.track) {
    track = options.track.join(',');
    body.track = track;
    params.track = track;
  }

  if (options.follow) {
    follow = options.follow.join(',');
    body.follow = follow;
    params.follow = follow;
  }

  signature = oauth.hmacsign(
    'POST',
    'https://stream.twitter.com/1.1/statuses/filter.json',
    params,
    options.auth.consumerSecret,
    options.auth.tokenSecret
  );

  delete params.track;
  delete params.follow;

  this.request = https.request({
    host: 'stream.twitter.com',
    headers: {
      authorization: 'OAuth ' + Object.keys(params).sort().map(function (key) {
        return key + '="' + oauth.rfc3986(params[key]) + '"';
      }).join(',') + ',oauth_signature="' + oauth.rfc3986(signature) + '"',
      'content-type': 'application/x-www-form-urlencoded'
    },
    path: '/1.1/statuses/filter.json',
    method: 'POST'
  });

  this.request.write(querystring.encode(body) + '\n');
  this.request.end();

  this.request.on('response', this._onResponse.bind(this));
};
util.inherits(Twitstream, ReadableStream);

Twitstream.prototype._onResponse = function (res) {
  var data = '',
      self = this;

  res.on('readable', function () {
    var chunk = res.read(),
        split;

    data += chunk;
    split = data.split('\n');
    data = split.pop();

    function parseJson (line) {
      try {
        return JSON.parse(line);
      }
      catch (ex) {
        self.emit('error', ex);
        return '';
      }
    }

    split.forEach(function (line) {
      self.push(parseJson(line));
    });
  });
};

Twitstream.prototype._read = function () {
};

module.exports = function (options) {
  return new Twitstream(options);
};

module.exports.Twitstream = Twitstream;
