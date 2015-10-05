'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');

const httpController = require('./httpController');

const application = express();
application.use(bodyParser.json());
application.use(compression());
application.use('/', httpController);

module.export = application;
