'use strict';

const express = require('express');
const co = require('co');

const expect = require('chai').expect;
require('co-mocha');

const FakeExpressHttp = require('fake-express-http');
const httpController = require('../httpController');

describe('server', () => {
  it('should GET 404 initially', function *() {
    const fakeHttp = new FakeExpressHttp();
    fakeHttp.request.url = '/';

    const controller = httpController(express.Router());
    controller(fakeHttp.request, fakeHttp.response, fakeHttp.next);

    yield fakeHttp.response.onEnd();
    expect(fakeHttp.response.statusCode).to.equal(404);
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

    const fakeHttp = new FakeExpressHttp();
    fakeHttp.request.url = '/answer';

    controller(fakeHttp.request, fakeHttp.response, fakeHttp.next);

    yield fakeHttp.response.onEnd();
    expect(fakeHttp.response.statusCode).to.equal(200);
    expect(fakeHttp.response.headers['content-type']).to.equal('application/json');
    expect(fakeHttp.response.content).to.equal('42');
  });

  it('should PUT by path', function *() {
    const controller = httpController(express.Router());
    yield givenValueIs(controller, {});

    const fakeHttp = new FakeExpressHttp();
    fakeHttp.request.method = 'PUT';
    fakeHttp.request.url = '/answer';
    fakeHttp.request.headers['content-type'] = 'application/json';
    fakeHttp.request.body = 42;

    controller(fakeHttp.request, fakeHttp.response, fakeHttp.next);

    yield fakeHttp.response.onEnd();
    return assertValueIs(controller, {
      answer: 42
    });
  });

  it('should DELETE by path', function *() {
    const controller = httpController(express.Router());
    yield givenValueIs(controller, {
      answer: 42
    });

    const fakeHttp = new FakeExpressHttp();
    fakeHttp.request.method = 'DELETE';
    fakeHttp.request.url = '/answer';
    fakeHttp.request.headers['content-type'] = 'application/json';

    controller(fakeHttp.request, fakeHttp.response, fakeHttp.next);

    yield fakeHttp.response.onEnd();
    return assertValueIs(controller, {});
  });

  it('should fail to GET by path for arrays', function *() {
    const controller = httpController(express.Router());
    yield givenValueIs(controller, [
      42
    ]);

    const fakeHttp = new FakeExpressHttp();
    fakeHttp.request.url = '/answer';

    controller(fakeHttp.request, fakeHttp.response, fakeHttp.next);

    yield fakeHttp.response.onEnd();
    expect(fakeHttp.response.statusCode).to.equal(400);
  });

  it('should fail to GET by path for non-objects', function *() {
    const controller = httpController(express.Router());
    yield givenValueIs(controller, 42);

    const fakeHttp = new FakeExpressHttp();
    fakeHttp.request.url = '/answer';

    controller(fakeHttp.request, fakeHttp.response, fakeHttp.next);

    yield fakeHttp.response.onEnd();
    expect(fakeHttp.response.statusCode).to.equal(400);
  });

  it('should reset to 404 on DELETE', function *() {
    const controller = httpController(express.Router());
    yield givenValueIs(controller, {
      answer: 42
    });

    const fakeHttp = new FakeExpressHttp();
    fakeHttp.request.method = 'DELETE';
    fakeHttp.request.url = '/';

    controller(fakeHttp.request, fakeHttp.response, fakeHttp.next);

    yield fakeHttp.response.onEnd();
    return assertValueDoesNotExist(controller);
  });

  it('should only accept JSON on PUT', function *() {
    const fakeHttp = new FakeExpressHttp();
    fakeHttp.request.method = 'PUT';
    fakeHttp.request.url = '/';
    fakeHttp.request.body = 'Good day sir!';

    const controller = httpController(express.Router());
    controller(fakeHttp.request, fakeHttp.response, fakeHttp.next);

    yield fakeHttp.response.onEnd();
    expect(fakeHttp.response.statusCode).to.equal(400);
  });
});

function givenValueIs(controller, value) {
  const fakeHttp = new FakeExpressHttp();
  fakeHttp.request.method = 'PUT';
  fakeHttp.request.url = '/';
  fakeHttp.request.headers['content-type'] = 'application/json';
  fakeHttp.request.body = value;

  controller(fakeHttp.request, fakeHttp.response, fakeHttp.next);
  return fakeHttp.response.onEnd();
}

function assertValueDoesNotExist(controller) {
  return co(function *() {
    const fakeHttp = new FakeExpressHttp();
    fakeHttp.request.url = '/';

    controller(fakeHttp.request, fakeHttp.response, fakeHttp.next);

    yield fakeHttp.response.onEnd();
    expect(fakeHttp.response.statusCode).to.equal(404);
  });
}

function assertValueIs(controller, expected) {
  return co(function *() {
    const fakeHttp = new FakeExpressHttp();
    fakeHttp.request.url = '/';

    controller(fakeHttp.request, fakeHttp.response, fakeHttp.next);

    yield fakeHttp.response.onEnd();
    expect(fakeHttp.response.statusCode).to.equal(200);
    expect(fakeHttp.response.headers['content-type']).to.equal('application/json');
    expect(fakeHttp.response.content).to.eql(JSON.stringify(expected));
  });
}
