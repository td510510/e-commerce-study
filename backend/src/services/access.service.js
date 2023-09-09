'use strict';

const bcrypt = require('bcrypt');
const shopModel = require('../models/shop.model');
const crypto = require('node:crypto');
const TokenKeyService = require('./tokenKey.service');
const { createTokenPair } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { BadRequestError } = require('../core/error.response');

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN',
};

class AccessService {
  static signup = async ({ name, email, password }) => {
    // try {
    const holderShop = await shopModel.findOne({ email }).lean();

    if (holderShop) {
      // return {
      //   code: 'xxx',
      //   message: 'Shop already exists',
      // };
      throw new BadRequestError('Error: Shop already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: RoleShop.SHOP,
    });

    if (newShop) {
      // const { publicKey, privateKey } = await crypto.generateKeyPairSync(
      //   'rsa',
      //   {
      //     modulusLength: 4096,
      //     publicKeyEncoding: {
      //       type: 'pkcs1',
      //       format: 'pem',
      //     },
      //     privateKeyEncoding: {
      //       type: 'pkcs1',
      //       format: 'pem',
      //     },
      //   }
      // );

      const publicKey = crypto.randomBytes(64).toString('hex');
      const privateKey = crypto.randomBytes(64).toString('hex');

      // const publicKeyString = await TokenKeyService.createTokenKey({
      //   userId: newShop._id,
      //   publicKey,
      // });

      const keyStore = await TokenKeyService.createTokenKey({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      // if (!publicKeyString) {
      //   return {
      //     code: 'xxx',
      //     message: 'publicKeyString error',
      //   };
      // }

      if (!keyStore) {
        throw new BadRequestError('Error: keyStore error');
        // return {
        //   code: 'xxx',
        //   message: 'keyStore error',
        // };
      }

      // const tokens = await createTokenPair(
      //   {
      //     userId: newShop._id,
      //     email,
      //   },
      //   publicKeyString,
      //   privateKey
      // );

      const tokens = await createTokenPair(
        {
          userId: newShop._id,
          email,
        },
        publicKey,
        privateKey
      );

      return {
        code: 201,
        metadata: {
          shop: getInfoData({
            fields: ['_id', 'name', 'email'],
            object: newShop,
          }),
          tokens,
        },
      };
    }

    return {
      code: 200,
      metadata: null,
    };
    // } catch (error) {
    //   return {
    //     code: 'xxx',
    //     message: error.message,
    //     status: 'error',
    //   };
    // }
  };
}

module.exports = AccessService;
