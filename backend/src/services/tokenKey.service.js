'use strict';

const tokenKeyModel = require('../models/tokenKey.model');

class TokenKeyService {
  static createTokenKey = async ({ userId, publicKey, privateKey }) => {
    try {
      const publicKeyString = publicKey.toString();
      const tokens = await tokenKeyModel.create({
        user: userId,
        // publicKey: publicKeyString,
        publicKey,
        privateKey,
      });

      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };
}

module.exports = TokenKeyService;
