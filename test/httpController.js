'use strict';

const express = require('express');
const expect = require('chai').expect;

const fakeHttp = require('../fake/http');
const FakeHttpRequest = fakeHttp.FakeHttpRequest;
const FakeHttpResponse = fakeHttp.FakeHttpResponse;
const httpController = require('../httpController');

describe('server', () => {
  it('should GET 404 initially', (done) => {
    const request = new FakeHttpRequest();
    request.url = '/';
    const response = new FakeHttpResponse(() => {
      expect(response.statusCode).to.equal(404);
      done();
    });

    const controller = httpController(express.Router());
    controller(request, response);
  });

  it('should GET a value that exists', (done) => {
    const controller = httpController(express.Router());
    givenValueIs(controller, {
      answer: 42
    });

    const request = new FakeHttpRequest();
    request.url = '/';
    const response = new FakeHttpResponse(() => {
      expect(response.statusCode).to.equal(200);
      expect(response.headers['Content-Type']).to.equal('application/json');
      expect(response.data).to.eql({
        answer: 42
      });
      done();
    });

    controller(request, response);
  });

  it('should GET by path', (done) => {
    const controller = httpController(express.Router());
    givenValueIs(controller, {
      answer: 42
    });

    const request = new FakeHttpRequest();
    request.url = '/answer';
    const response = new FakeHttpResponse(() => {
      expect(response.statusCode).to.equal(200);
      expect(response.headers['Content-Type']).to.equal('application/json');
      expect(response.data).to.equal(42);
      done();
    });

    controller(request, response);
  });

  it('should reset to 404 on DELETE', (done) => {
    const controller = httpController(express.Router());
    givenValueIs(controller, {
      answer: 42
    });

    const request = new FakeHttpRequest();
    request.method = 'DELETE';
    request.url = '/';
    const response = new FakeHttpResponse();

    controller(request, response);

    assertValueDoesNotExist(controller, done);
  });

  it('should only accept JSON on PUT', (done) => {
    const request = new FakeHttpRequest();
    request.method = 'PUT';
    request.url = '/';
    request.body = 'Good day sir!';
    const response = new FakeHttpResponse(() => {
      expect(response.statusCode).to.equal(400);
      done();
    });

    const controller = httpController(express.Router());
    controller(request, response);
  });

  it('should only accept Object JSON on PUT', (done) => {
    const request = new FakeHttpRequest();
    request.method = 'PUT';
    request.url = '/';
    request.headers['Content-Type'] = 'application/json';
    request.body = [];
    const response = new FakeHttpResponse(() => {
      expect(response.statusCode).to.equal(400);
      done();
    });

    const controller = httpController(express.Router());
    controller(request, response);
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
}

function assertValueDoesNotExist(controller, done) {
  const request = new FakeHttpRequest();
  request.url = '/';
  const response = new FakeHttpResponse(() => {
    expect(response.statusCode).to.equal(404);
    done();
  });

  controller(request, response);
}
