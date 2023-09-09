'use strict';

const mongoose = require('mongoose');
const { countConnection } = require('../helpers/check.connect');
const {
  db: { host, port, name },
} = require('../configs/config.mongodb');

const connectUri = `mongodb://${host}:${port}/${name}`;

class Database {
  constructor() {
    this.connect();
  }

  connect(type = 'mongodb') {
    if (1 === 1) {
      mongoose.set('debug', true);
      mongoose.set('debug', { color: true });
    }

    console.log(connectUri);

    mongoose
      .connect(connectUri, {
        maxPoolSize: 50,
      })
      .then(() => {
        console.log('Database is connected', countConnection());
      })
      .catch((err) => {
        console.log('database connecting is failed ', err);
      });
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }
}

const instanceMongodb = Database.getInstance();

module.exports = instanceMongodb;
