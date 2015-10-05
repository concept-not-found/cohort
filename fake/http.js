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
  constructor() {
    this.headers = {};
    this.statusCode = 200;
    this.body = undefined;
  }

  json(document) {
    this.headers['Content-Type'] = 'application/json';
    this.body = document;
  }
}

module.exports = {
  FakeHttpRequest,
  FakeHttpResponse
};
