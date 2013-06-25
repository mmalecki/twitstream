var util = require('util'),
    https = require('https'),
    querystring = require('querystring'),
    uuid = require('node-uuid'),
    oauth = require('oauth-sign'),
    ReadableStream = require('stream').Readable;

var Userstream = function (options) {
  var signature, params;

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

  var pathString = '/1.1/user.json';
  
  var requestParams = {}
  if(options.with) {
    requestParams['with'] = options.with;
  }

  if(options.replies) {
    requestParams['replies'] = options.replies;
  }

  signature = oauth.hmacsign(
    'GET',
    'https://userstream.twitter.com/1.1/user.json',
    params,
    options.auth.consumerSecret,
    options.auth.tokenSecret
  );

  this.request = https.request({
    host: 'userstream.twitter.com',
    headers: {
      authorization: 'OAuth ' + Object.keys(params).sort().map(function (key) {
        return key + '="' + oauth.rfc3986(params[key]) + '"';
      }).join(',') + ',oauth_signature="' + oauth.rfc3986(signature) + '"'
    },
    path: '/1.1/user.json',
    method: 'GET',
    query: querystring.stringify(requestParams)
  });

  this.request.end();

  this.request.on('response', this._onResponse.bind(this));
};

util.inherits(Userstream, ReadableStream);

Userstream.prototype._onResponse = function (res) {
  var data = '',
      self = this;

  res.on('readable', function () {
    var chunk = res.read(),
        split;

    data += chunk;
    split = data.split('\n');
    data = split.pop();

    split.forEach(function (line) {
      if(line.replace(/^[\s\n\r]*/g, "").length > 0) {  // Ignore empty lines that keep the HTTP session alive.
        self.push(JSON.parse(line));
      }
    });
  });
};

Userstream.prototype._read = function () {
};

module.exports = function (options) {
  return new Userstream(options);
};

module.exports.Userstream = Userstream;

