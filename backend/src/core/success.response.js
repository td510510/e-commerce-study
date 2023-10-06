'use strict';

const statusCodes = {
  OK: 200,
  CREATED: 201,
};

const reasonStatusCodes = {
  OK: 'Success',
  CREATED: 'Created',
};

class SuccessResponse {
  constructor({
    message,
    statusCode = statusCodes.OK,
    reasonStatusCode = reasonStatusCodes.OK,
    metadata = {},
  }) {
    this.message = !message ? reasonStatusCode : message;
    this.statusCode = statusCode;
    this.metadata = metadata;
  }

  send(res, headers = {}) {
    return res.status(this.statusCode).json(this);
  }
}

class OK extends SuccessResponse {
  constructor({ message, metadata }) {
    super({ message, metadata });
  }
}

class Created extends SuccessResponse {
  constructor({
    message,
    statusCode = statusCodes.CREATED,
    reasonStatusCode = reasonStatusCodes.CREATED,
    metadata,
  }) {
    super({ message, statusCode, reasonStatusCode, metadata });
  }
}

module.exports = {
  OK,
  Created,
  SuccessResponse,
};
