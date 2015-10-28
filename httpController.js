'use strict';

const url = require('url');
const R = require('ramda');
const co = require('co');
const coExpress = require('co-express');

function walk(value, path, closure) {
  if (value === undefined || R.isEmpty(path)) {
    return Promise.resolve(closure(value, undefined));
  }
  const valueType = typeof value;
  if (valueType !== 'object') {
    return Promise.reject(`expected object, but got ${valueType}`);
  }
  if (R.isArrayLike(value)) {
    return Promise.reject('expected object, but got array');
  }

  const next = path[0];
  if (path.length === 1) {
    return closure(value, next);
  }
  return walk(value[next], path.slice(1));
}

function controller(request, response, value, closure, onFound) {
  return co(function *() {
    const path = parsePath(request.url);
    try {
      const found = yield walk(value, path, closure);
      if (found === undefined) {
        return response.sendStatus(404);
      }
      return onFound(found);
    } catch (error) {
      return response.status(400).send(error);
    }
  });
}

module.exports = (router) => {
  let value = undefined;

  router.get('*', coExpress(function *(request, response) {
    yield controller(request, response, value, (parent, last) => {
      if (parent === undefined || last === undefined) {
        return Promise.resolve(parent);
      }
      return Promise.resolve(parent[last]);
    }, (found) => response.json(found));
  }));

  router.put('*', coExpress(function *(request, response) {
    if (!request.is('application/json')) {
      return response.status(400).send('content-type must be application/json');
    }
    yield controller(request, response, value, (parent, last) => {
      if (parent === undefined) {
        if (last === undefined) {
          value = request.body;
          return Promise.resolve(value);
        }
        return Promise.resolve(parent);
      }
      parent[last] = request.body;
      return Promise.resolve(parent[last]);
    }, (found) => response.json(found));
  }));

  router.delete('*', coExpress(function *(request, response) {
    yield controller(request, response, value, (parent, last) => {
      if (parent === undefined) {
        return Promise.resolve(parent);
      }
      if (last === undefined) {
        value = undefined;
        return Promise.resolve(value);
      }
      delete parent[last];
      return Promise.resolve(true);
    }, () => response.sendStatus(204));
  }));

  return router;
};

function parsePath(requestUrl) {
  const path = url.parse(requestUrl).pathname;
  if (path === '/') {
    return [];
  }
  return path.split('/').slice(1);
}
