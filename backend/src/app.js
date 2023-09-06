'use strict';

const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const app = express();

// init middleware
app.use(morgan('dev'));
app.use(helmet());
app.use(compression());

// init db
require('./dbs/init.mongodb');
const { checkOverLoad } = require('./helpers/check.connect');
checkOverLoad();

// init routes
app.get('/', (req, res, next) => {
  const strCompress = 'Hello ae';

  return res.status(200).json({
    message: 'Welcome init route test',
    metadata: strCompress.repeat(100000),
  });
});

// handle error

module.exports = app;
