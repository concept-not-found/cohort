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

  const next = path[0];
  if (path.length === 1) {
    return closure(value, next);
  }
  return walk(value[next], path.slice(1));
}

module.exports = (router) => {
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
          if (last === undefined) {
            value = request.body;
            return Promise.resolve(value);
          }
          return Promise.resolve(parent);
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

  router.delete('*', co(function *(request, response) {
    const path = parsePath(request.url);
    try {
      const found = yield walk(value, path, (parent, last) => {
        if (parent === undefined) {
          return Promise.resolve(parent);
        }
        if (last === undefined) {
          value = undefined;
          return Promise.resolve(value);
        }
        delete parent[last];
        return Promise.resolve(parent);
      });
      if (found === undefined) {
        return response.sendStatus(404);
      }
      return response.sendStatus(204);
    } catch (error) {
      return response.status(400).body(error);
    }
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
