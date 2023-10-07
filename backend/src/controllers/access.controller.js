'use strict';

const { Created, SuccessResponse } = require('../core/success.response');
const AccessService = require('../services/access.service');

class AccessController {
  handleRefreshToken = async (req, res, next) => {
    // new SuccessResponse({
    //   message: 'Get token success',
    //   metadata: await AccessService.handleRefreshToken(req.body.refreshToken),
    // }).send(res);

    // V2 fixed
    new SuccessResponse({
      message: 'Get token success',
      metadata: await AccessService.handleRefreshTokenV2({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore,
      }),
    }).send(res);
  };

  login = async (req, res, next) => {
    new SuccessResponse({
      metadata: await AccessService.login(req.body),
    }).send(res);
  };

  logout = async (req, res, next) => {
    new SuccessResponse({
      message: 'logout success',
      metadata: await AccessService.logout(req.keyStore),
    }).send(res);
  };

  signup = async (req, res, next) => {
    // try {
    //   console.log('[P]::Sign up', req.body);
    const metadata = await AccessService.signup(req.body);
    new Created({
      message: 'Register Successfully',
      metadata,
    }).send(res);
    // return res.status(201).json(await AccessService.signup(req.body));
    // } catch (error) {
    //   next(error);
    // }
  };
}

module.exports = new AccessController();
