'use strict';

const url = require('url');
const R = require('ramda');
const Immutable = require('seamless-immutable');

function Case(name) {
  const values = [];
  for (let i = 1; i < arguments.length; i++) {
    values.push(arguments[i]);
  }
  return Immutable({
    name,
    values
  });
}

function match(c) {
  const cases = {};
  return {
    is(name, closure) {
      cases[name] = closure;
      return this;
    },
    otherwise(closure) {
      const matching = cases[c.name];
      if (matching) {
        matching.apply(this, c.values);
      } else {
        closure();
      }
    }
  };
}

function walk(value, path) {
  if (value === undefined) {
    return Case('not found');
  }
  if (R.isEmpty(path)) {
    return Case('found', value);
  }
  const valueType = typeof value;
  if (valueType !== 'object') {
    return Case('error', `expected object, but got ${valueType}`);
  }
  if (R.isArrayLike(value)) {
    return Case('error', 'expected object, but got array');
  }

  const next = path[0];
  return walk(value[next], path.slice(1));
}

module.exports = (router) => {
  const key = [];
  let value = undefined;

  router.get('*', (request, response, next) => {
    const path = parsePath(request.url);
    match(walk(value, path))
      .is('not found', () => response.sendStatus(404))
      .is('found', (foundValue) => response.json(foundValue))
      .is('error', next)
      .otherwise();
  });

  router.put('*', (request, response) => {
    const path = parsePath(request.url);
    if (!request.is('application/json')) {
      return response.status(400).body('Content-Type must be application/json');
    }
    if (!R.equals(key, path)) {
      return response.sendStatus(404);
    }
    if (!R.is(Object, request.body) || R.isArrayLike(request.body)) {
      return response.status(400).body('body must be a JSON object');
    }
    value = request.body;
    response.json(value);
  });

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
