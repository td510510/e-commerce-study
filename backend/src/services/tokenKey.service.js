'use strict';

const { Types } = require('mongoose');

const tokenKeyModel = require('../models/tokenKey.model');

class TokenKeyService {
  static createTokenKey = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    try {
      // const publicKeyString = publicKey.toString();
      // const tokens = await tokenKeyModel.create({
      //   user: userId,
      //   // publicKey: publicKeyString,
      //   publicKey,
      //   privateKey,
      // });

      // return tokens ? tokens.publicKey : null;

      const filter = { user: userId };
      const update = {
        publicKey,
        privateKey,
        refreshToken,
        refreshTokenUsed: [],
      };
      const options = { upsert: true, new: true };
      const tokens = await tokenKeyModel.findOneAndUpdate(
        filter,
        update,
        options
      );
      return tokens;
    } catch (error) {
      return error;
    }
  };

  static findByUserId = async (userId) => {
    return await tokenKeyModel.findOne({ user: userId }).lean();
  };

  static removeKeyById = async (id) => {
    return await tokenKeyModel.deleteOne({
      _id: new Types.ObjectId(id),
    });
  };

  static findByRefreshTokenUsed = async (refreshToken) => {
    console.log('refreshToken', refreshToken);
    return await tokenKeyModel
      .findOne({ refreshTokenUsed: refreshToken })
      .lean();
  };

  static findByRefreshToken = async (refreshToken) => {
    return await tokenKeyModel.findOne({ refreshToken });
  };

  static deleteKeyById = async (userId) => {
    return await tokenKeyModel.findByIdAndDelete({ user: userId });
  };
}

module.exports = TokenKeyService;
