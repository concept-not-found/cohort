'use strict';

const express = require('express');
const co = require('co');

const expect = require('chai').expect;
require('co-mocha');

const fakeHttp = require('../fake/http');
const FakeHttpRequest = fakeHttp.FakeHttpRequest;
const FakeHttpResponse = fakeHttp.FakeHttpResponse;
const httpController = require('../httpController');

describe('server', () => {
  it('should GET 404 initially', function *() {
    const request = new FakeHttpRequest();
    request.url = '/';
    const response = new FakeHttpResponse();

    const controller = httpController(express.Router());
    controller(request, response);

    yield response.onEnd();
    expect(response.statusCode).to.equal(404);
  });

  it('should GET a value that was PUT', function *() {
    const controller = httpController(express.Router());
    yield givenValueIs(controller, {
      answer: 42
    });

    return assertValueIs(controller, {
      answer: 42
    });
  });

  it('should GET by path', function *() {
    const controller = httpController(express.Router());
    yield givenValueIs(controller, {
      answer: 42
    });

    const request = new FakeHttpRequest();
    request.url = '/answer';
    const response = new FakeHttpResponse();

    controller(request, response);

    yield response.onEnd();
    expect(response.statusCode).to.equal(200);
    expect(response.headers['Content-Type']).to.equal('application/json');
    expect(response.data).to.equal(42);
  });

  it('should PUT by path', function *() {
    const controller = httpController(express.Router());
    yield givenValueIs(controller, {});

    const request = new FakeHttpRequest();
    request.method = 'PUT';
    request.url = '/answer';
    request.headers['Content-Type'] = 'application/json';
    request.body = 42;
    const response = new FakeHttpResponse();

    controller(request, response);

    yield response.onEnd();
    return assertValueIs(controller, {
      answer: 42
    });
  });

  it('should DELETE by path', function *() {
    const controller = httpController(express.Router());
    yield givenValueIs(controller, {
      answer: 42
    });

    const request = new FakeHttpRequest();
    request.method = 'DELETE';
    request.url = '/answer';
    request.headers['Content-Type'] = 'application/json';
    const response = new FakeHttpResponse();

    controller(request, response);

    yield response.onEnd();
    return assertValueIs(controller, {});
  });

  it('should fail to GET by path for arrays', function *() {
    const controller = httpController(express.Router());
    yield givenValueIs(controller, [
      42
    ]);

    const request = new FakeHttpRequest();
    request.url = '/answer';
    const response = new FakeHttpResponse();

    controller(request, response);

    yield response.onEnd();
    expect(response.statusCode).to.equal(400);
  });

  it('should fail to GET by path for non-objects', function *() {
    const controller = httpController(express.Router());
    yield givenValueIs(controller, 42);

    const request = new FakeHttpRequest();
    request.url = '/answer';
    const response = new FakeHttpResponse();

    controller(request, response);

    yield response.onEnd();
    expect(response.statusCode).to.equal(400);
  });

  it('should reset to 404 on DELETE', function *() {
    const controller = httpController(express.Router());
    yield givenValueIs(controller, {
      answer: 42
    });

    const request = new FakeHttpRequest();
    request.method = 'DELETE';
    request.url = '/';
    const response = new FakeHttpResponse();

    controller(request, response);

    yield response.onEnd();
    return assertValueDoesNotExist(controller);
  });

  it('should only accept JSON on PUT', function *() {
    const request = new FakeHttpRequest();
    request.method = 'PUT';
    request.url = '/';
    request.body = 'Good day sir!';
    const response = new FakeHttpResponse();

    const controller = httpController(express.Router());
    controller(request, response);

    yield response.onEnd();
    expect(response.statusCode).to.equal(400);
  });
});

function givenValueIs(controller, value) {
  const request = new FakeHttpRequest();
  request.method = 'PUT';
  request.url = '/';
  request.headers['Content-Type'] = 'application/json';
  request.body = value;
  const response = new FakeHttpResponse();

  controller(request, response);
  return response.onEnd();
}

function assertValueDoesNotExist(controller) {
  return co(function *() {
    const request = new FakeHttpRequest();
    request.url = '/';
    const response = new FakeHttpResponse();

    controller(request, response);

    yield response.onEnd();
    expect(response.statusCode).to.equal(404);
  });
}

function assertValueIs(controller, expected) {
  return co(function *() {
    const request = new FakeHttpRequest();
    request.url = '/';
    const response = new FakeHttpResponse();

    controller(request, response);

    yield response.onEnd();
    expect(response.statusCode).to.equal(200);
    expect(response.headers['Content-Type']).to.equal('application/json');
    expect(response.data).to.eql(expected);
  });
}
