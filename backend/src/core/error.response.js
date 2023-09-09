'use strict';

const statusCodes = {
  FORBIDDEN: 403,
  CONFLICT: 409,
};

const reasonStatusCodes = {
  FORBIDDEN: 'Bad request error',
  CONFLICT: 'Conflict error',
};

class ErrorResponse extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

class ConflictRequestError extends ErrorResponse {
  constructor(
    message = reasonStatusCodes.CONFLICT,
    statusCode = statusCodes.CONFLICT
  ) {
    super(message, statusCode);
  }
}

class BadRequestError extends ErrorResponse {
  constructor(
    message = reasonStatusCodes.FORBIDDEN,
    statusCode = statusCodes.FORBIDDEN
  ) {
    super(message, statusCode);
  }
}

module.exports = {
  ConflictRequestError,
  BadRequestError,
};
