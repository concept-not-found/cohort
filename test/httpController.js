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
    expect(response.body).to.eql({});
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
    expect(putResponse.body).to.eql({
      answer: 42
    });

    const getRequest = new FakeHttpRequest();
    getRequest.url = '/';
    const getResponse = new FakeHttpResponse();

    controller(getRequest, getResponse);

    expect(getResponse.statusCode).to.equal(200);
    expect(getResponse.headers['Content-Type']).to.equal('application/json');
    expect(getResponse.body).to.eql({
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
    expect(putResponse.body).to.eql({
      answer: 42
    });

    const deleteRequest = new FakeHttpRequest();
    deleteRequest.method = 'DELETE';
    deleteRequest.url = '/';
    const deleteResponse = new FakeHttpResponse();

    controller(deleteRequest, deleteResponse);

    expect(deleteResponse.statusCode).to.equal(200);
    expect(deleteResponse.headers['Content-Type']).to.equal('application/json');
    expect(deleteResponse.body).to.eql({});

    const getRequest = new FakeHttpRequest();
    getRequest.url = '/';
    const getResponse = new FakeHttpResponse();

    controller(getRequest, getResponse);

    expect(getResponse.statusCode).to.equal(200);
    expect(getResponse.headers['Content-Type']).to.equal('application/json');
    expect(getResponse.body).to.eql({});
  });
});
