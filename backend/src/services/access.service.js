'use strict';

const bcrypt = require('bcrypt');
const shopModel = require('../models/shop.model');
const crypto = require('node:crypto');
const TokenKeyService = require('./tokenKey.service');
const { createTokenPair, verifyJWT } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require('../core/error.response');
const { findByEmail } = require('./shop.service');

const RoleShop = {
  SHOP: 'SHOP',
  WRITER: 'WRITER',
  EDITOR: 'EDITOR',
  ADMIN: 'ADMIN',
};

class AccessService {
  /*
  Check: Was token used?
  
  */
  static handleRefreshToken = async (refreshToken) => {
    const foundToken = await TokenKeyService.findByRefreshTokenUsed(
      refreshToken
    );
    console.log('found token', foundToken);
    if (foundToken) {
      // decode: Check who is accessing
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      );

      // delete ann used tokens
      await TokenKeyService.deleteKeyById(userId);
      throw new ForbiddenError('Something went wrong! Please try login again');
    }

    const holderToken = await TokenKeyService.findByRefreshToken(refreshToken);
    if (!holderToken) throw new AuthFailureError('Shop is not register');

    // verify token
    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );

    // check userId
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new AuthFailureError('Shop is not register');

    // create new token
    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    );

    // update token
    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokenUsed: refreshToken, // used to get token
      },
    });

    return {
      user: { userId, email },
      tokens,
    };
  };

  static logout = async (keyStore) => {
    const deleteKey = await TokenKeyService.removeKeyById(keyStore._id);
    return deleteKey;
  };

  /*
      1 - Check email in dbs
      2 - Match password
      3 - Create AT and RT and save
      4 - Generate tokens
      5 - Get data return login
  */

  static login = async ({ email, password, refreshToken = null }) => {
    // 1 - Check email in dbs
    const foundShop = await findByEmail({ email });
    if (!foundShop) {
      throw new BadRequestError('Shop is not register');
    }

    // 2 - Match password
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) {
      throw new AuthFailureError('Authentication error');
    }

    // 3 Create Private key vs Public key
    const publicKey = crypto.randomBytes(64).toString('hex');
    const privateKey = crypto.randomBytes(64).toString('hex');

    // 4 Generate tokens
    const { _id: userId } = foundShop;
    const tokens = await createTokenPair(
      {
        userId,
        email,
      },
      publicKey,
      privateKey
    );

    await TokenKeyService.createTokenKey({
      userId,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken,
    });

    return {
      metadata: {
        shop: getInfoData({
          fields: ['_id', 'name', 'email'],
          object: foundShop,
        }),
        tokens,
      },
    };
  };

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

      const tokens = await createTokenPair(
        {
          userId: newShop._id,
          email,
        },
        publicKey,
        privateKey
      );

      const keyStore = await TokenKeyService.createTokenKey({
        userId: newShop._id,
        publicKey,
        privateKey,
        refreshToken: tokens.refreshToken,
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
