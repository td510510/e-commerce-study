'use strict';

const mongoose = require('mongoose');
const os = require('os');
const _SECOND = 5000;

const countConnection = () => {
  const numConnection = mongoose.connections.length;
  console.log(`Number of connection: ${numConnection}`);
};

const checkOverLoad = () => {
  setInterval(() => {
    const numConnection = mongoose.connections.length;
    const numCores = os.cpus.length;
    const usedMemory = process.memoryUsage().rss;
    // Example maximum number of connection based on number of cores
    const maxConnection = numCores * 5;

    console.log(`Active connection: ${numConnection}`);
    console.log(`Memory is using: ${usedMemory / 1024 / 1024}MB`);

    if (numConnection > maxConnection) {
      console.log('Connection over load detected');
      // send notify to team
    }
  }, _SECOND); // Monitor every 5 seconds
};

module.exports = {
  countConnection,
  checkOverLoad,
};
