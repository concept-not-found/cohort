'use strict';

class FakeHttpRequest {
  constructor() {
    this.method = 'GET';
    this.url = undefined;
    this.headers = {};
  }

  is(expectedContentType) {
    return this.headers['Content-Type'] === expectedContentType;
  }
}

class FakeHttpResponse {
  constructor(callback) {
    this.headers = {};
    this.statusCode = 200;
    this.data = undefined;
    this.callback = callback || function() {};
  }

  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  }

  sendStatus(statusCode) {
    this.statusCode = statusCode;
    this.end();
  }

  body(data) {
    this.data = data;
    this.end();
  }

  json(document) {
    this.headers['Content-Type'] = 'application/json';
    this.data = document;
    this.end();
  }

  end() {
    setImmediate(this.callback);
  }
}

module.exports = {
  FakeHttpRequest,
  FakeHttpResponse
};
