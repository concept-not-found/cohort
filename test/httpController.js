'use strict';

const express = require('express');
const expect = require('chai').expect;

const fakeHttp = require('../fake/http');
const FakeHttpRequest = fakeHttp.FakeHttpRequest;
const FakeHttpResponse = fakeHttp.FakeHttpResponse;
const httpController = require('../httpController');

describe('server', () => {
  it('should GET 404 initially', () => {
    const request = new FakeHttpRequest();
    request.url = '/';
    const response = new FakeHttpResponse();

    const controller = httpController(express.Router());
    controller(request, response);

    expect(response.statusCode).to.equal(404);
  });

  it('should GET a value that exists', () => {
    const controller = httpController(express.Router());
    givenValueIs(controller, {
      answer: 42
    });

    const getRequest = new FakeHttpRequest();
    getRequest.url = '/';
    const getResponse = new FakeHttpResponse();

    controller(getRequest, getResponse);

    expect(getResponse.statusCode).to.equal(200);
    expect(getResponse.headers['Content-Type']).to.equal('application/json');
    expect(getResponse.data).to.eql({
      answer: 42
    });
  });

  it('should reset to 404 on DELETE', () => {
    const controller = httpController(express.Router());
    givenValueIs(controller, {
      answer: 42
    });

    const deleteRequest = new FakeHttpRequest();
    deleteRequest.method = 'DELETE';
    deleteRequest.url = '/';
    const deleteResponse = new FakeHttpResponse();

    controller(deleteRequest, deleteResponse);

    assertValueDoesNotExist(controller);
  });

  it('should only accept JSON on PUT', () => {
    const request = new FakeHttpRequest();
    request.method = 'PUT';
    request.url = '/';
    request.body = 'Good day sir!';
    const response = new FakeHttpResponse();

    const controller = httpController(express.Router());
    controller(request, response);

    expect(response.statusCode).to.equal(400);
  });

  it('should only accept Object JSON on PUT', () => {
    const request = new FakeHttpRequest();
    request.method = 'PUT';
    request.url = '/';
    request.headers['Content-Type'] = 'application/json';
    request.body = [];
    const response = new FakeHttpResponse();

    const controller = httpController(express.Router());
    controller(request, response);

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
}

function assertValueDoesNotExist(controller) {
  const request = new FakeHttpRequest();
  request.url = '/';
  const response = new FakeHttpResponse();

  controller(request, response);

  expect(response.statusCode).to.equal(404);
}
