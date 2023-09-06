'use strict';

const mongoose = require('mongoose');
const DATABASE_URL = process.env.DATABASE_URL;
const { countConnection } = require('../helpers/check.connect');

class Database {
  constructor() {
    this.connect();
  }

  connect(type = 'mongodb') {
    if (1 === 1) {
      mongoose.set('debug', true);
      mongoose.set('debug', { color: true });
    }

    mongoose
      .connect(DATABASE_URL, {
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
