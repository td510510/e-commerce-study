'use strict';

const dotenv = require('dotenv');
dotenv.config();
const app = require('./src/app');

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});

process.on('SIGINT', () => {
  server.close(() => console.log('Close server'));
});
