'use strict';

const url = require('url');
const R = require('ramda');
const co = require('co-express');

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
  if (path.length === 1) {
    return closure(value, path[0]);
  }

  const next = path[0];
  return walk(value[next], path.slice(1));
}

module.exports = (router) => {
  const key = [];
  let value = undefined;

  router.get('*', co(function *(request, response) {
    const path = parsePath(request.url);
    try {
      const found = yield walk(value, path, (parent, last) => {
        if (parent === undefined || last === undefined) {
          return Promise.resolve(parent);
        }
        return Promise.resolve(parent[last]);
      });
      if (found === undefined) {
        return response.sendStatus(404);
      }
      return response.json(found);
    } catch (error) {
      return response.status(400).body(error);
    }
  }));

  router.put('*', co(function *(request, response) {
    const path = parsePath(request.url);
    if (!request.is('application/json')) {
      return response.status(400).body('Content-Type must be application/json');
    }
    try {
      const found = yield walk(value, path, (parent, last) => {
        if (parent === undefined) {
          value = request.body;
          return Promise.resolve(value);
        }
        parent[last] = request.body;
        return Promise.resolve(parent[last]);
      });
      if (found === undefined) {
        return response.sendStatus(404);
      }
      return response.json(found);
    } catch (error) {
      return response.status(400).body(error);
    }
  }));

  router.delete('*', (request, response) => {
    const path = parsePath(request.url);
    if (value === undefined || !R.equals(key, path)) {
      return response.sendStatus(404);
    }
    value = undefined;
    response.sendStatus(204);
  });

  return router;
};

function parsePath(requestUrl) {
  const path = url.parse(requestUrl).pathname;
  if (path === '/') {
    return [];
  }
  return path.split('/').slice(1);
}
