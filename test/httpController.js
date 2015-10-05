'use strict';

const expect = require('chai').expect;
const fakeHttp = require('../fake/http');
const FakeHttpRequest = fakeHttp.FakeHttpRequest;
const FakeHttpResponse = fakeHttp.FakeHttpResponse;

const controller = require('../httpController');

describe('server', () => {
  it('should GET an empty document initially', () => {
    const request = new FakeHttpRequest();
    request.url = '/';
    const response = new FakeHttpResponse();

    controller(request, response);

    expect(response.statusCode).to.equal(200);
    expect(response.headers['Content-Type']).to.equal('application/json');
    expect(response.data).to.eql({});
  });

  it('should GET what was PUT', () => {
    const putRequest = new FakeHttpRequest();
    putRequest.method = 'PUT';
    putRequest.url = '/';
    putRequest.headers['Content-Type'] = 'application/json';
    putRequest.body = {
      answer: 42
    };
    const putResponse = new FakeHttpResponse();

    controller(putRequest, putResponse);

    expect(putResponse.statusCode).to.equal(200);
    expect(putResponse.headers['Content-Type']).to.equal('application/json');
    expect(putResponse.data).to.eql({
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

  it('should reset to an empty document on DELETE', () => {
    const putRequest = new FakeHttpRequest();
    putRequest.method = 'PUT';
    putRequest.url = '/';
    putRequest.headers['Content-Type'] = 'application/json';
    putRequest.body = {
      answer: 42
    };
    const putResponse = new FakeHttpResponse();

    controller(putRequest, putResponse);

    expect(putResponse.statusCode).to.equal(200);
    expect(putResponse.headers['Content-Type']).to.equal('application/json');
    expect(putResponse.data).to.eql({
      answer: 42
    });

    const deleteRequest = new FakeHttpRequest();
    deleteRequest.method = 'DELETE';
    deleteRequest.url = '/';
    const deleteResponse = new FakeHttpResponse();

    controller(deleteRequest, deleteResponse);

    expect(deleteResponse.statusCode).to.equal(200);
    expect(deleteResponse.headers['Content-Type']).to.equal('application/json');
    expect(deleteResponse.data).to.eql({});

    const getRequest = new FakeHttpRequest();
    getRequest.url = '/';
    const getResponse = new FakeHttpResponse();

    controller(getRequest, getResponse);

    expect(getResponse.statusCode).to.equal(200);
    expect(getResponse.headers['Content-Type']).to.equal('application/json');
    expect(getResponse.data).to.eql({});
  });

  it('should only accept JSON on PUT', () => {
    const request = new FakeHttpRequest();
    request.method = 'PUT';
    request.url = '/';
    request.body = 'Good day sir!';
    const response = new FakeHttpResponse();

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

    controller(request, response);

    expect(response.statusCode).to.equal(400);
  });
});
