'use strict';

const url = require('url');
const R = require('ramda');

module.exports = (router) => {
  let key = [];
  let value = undefined;

  router.get('*', (request, response) => {
    const path = parsePath(request.url);
    if (value === undefined || !R.equals(key, path)) {
      return response.sendStatus(404);
    }
    response.json(value);
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
