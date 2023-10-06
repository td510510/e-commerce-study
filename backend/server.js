'use strict';

const dotenv = require('dotenv');
dotenv.config();
const app = require('./src/app');
const config = require('./src/configs/config.mongodb');

const port = config.app.port;

const server = app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});

process.on('SIGINT', () => {
  server.close(() => console.log('Close server'));
});
