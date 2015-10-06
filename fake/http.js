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
    this.data = undefined;
  }

  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  }

  sendStatus(statusCode) {
    this.statusCode = statusCode;
  }

  body(data) {
    this.data = data;
  }

  json(document) {
    this.headers['Content-Type'] = 'application/json';
    this.data = document;
  }
}

module.exports = {
  FakeHttpRequest,
  FakeHttpResponse
};
