'use strict';

const express = require('express');
const accessController = require('../../controllers/access.controller');
const asyncHandler = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/authUtils');
const router = express.Router();

// signup
router.post('/shop/signup', asyncHandler(accessController.signup));
router.post('/shop/login', asyncHandler(accessController.login));

// authentication
router.use(authentication);

router.post('/shop/logout', accessController.logout);
router.post('/shop/refresh-token', accessController.handleRefreshToken);

module.exports = router;
