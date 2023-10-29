'use strict';

const jwt = require('jsonwebtoken');
const asyncHandler = require('../helpers/asyncHandler');
const { AuthFailureError, NotFoundError } = require('../core/error.response');
const { findByUserId } = require('../services/tokenKey.service');

const HEADER = {
  API_KEY: 'x-api-key',
  CLIENT_ID: 'x-client-id',
  AUTHORIZATION: 'authorization',
  REFRESH_TOKEN: 'x-refresh-token',
};

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    const accessToken = await jwt.sign(payload, publicKey, {
      // algorithm: 'RS256',
      expiresIn: '2 days',
    });

    const refreshToken = await jwt.sign(payload, privateKey, {
      // algorithm: 'RS256',
      expiresIn: '7 days',
    });

    jwt.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.log('Error verify', err);
      } else {
        console.log('decode verify', decode);
      }
    });

    return { accessToken, refreshToken };
  } catch (error) {}
};

const authentication = asyncHandler(async (req, res, next) => {
  /*
  1 - Check if userId miss
  2 - Get accessToken
  3 - Verify token
  4 - Check if user is in db
  5 - Check keyStore with this userId
  6 - If all is OK => return next()
  */

  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError('Invalid request');

  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError('KeyStore is not found');

  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError('Invalid request');

  try {
    const decodeUser = jwt.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId)
      throw new AuthFailureError('Invalid userId');
    req.keyStore = keyStore;
    return next();
  } catch (error) {}
});

const authenticationV2 = asyncHandler(async (req, res, next) => {
  /*
  1 - Check if userId miss
  2 - Get accessToken
  3 - Verify token
  4 - Check if user is in db
  5 - Check keyStore with this userId
  6 - If all is OK => return next()
  */

  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError('Invalid request');

  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError('KeyStore is not found');

  if (req.headers[HEADER.REFRESH_TOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESH_TOKEN];
      const decodeUser = jwt.verify(refreshToken, keyStore.privateKey);
      req.keyStore = keyStore;
      req.user = decodeUser;
      req.refreshToken = refreshToken;
      return next();
    } catch (error) {
      throw error;
    }
  }

  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError('Invalid request');

  try {
    const decodeUser = jwt.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId)
      throw new AuthFailureError('Invalid userId');
    req.keyStore = keyStore;
    return next();
  } catch (error) {}
});

const verifyJWT = async (token, keySecret) => {
  return await jwt.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  authentication,
  authenticationV2,
  verifyJWT,
};
