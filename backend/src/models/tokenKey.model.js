'use strict';

const { Schema, model } = require('mongoose'); // Erase if already required

const COLLECTION_NAME = 'tokenKeys';
const DOCUMENT_NAME = 'tokenKey';
// Declare the Schema of the Mongo model
const tokenKeySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Shop',
    },
    publicKey: {
      type: String,
      required: true,
    },
    privateKey: {
      type: String,
      required: true,
    },
    refreshTokenUsed: {
      // RefreshToken was used
      type: Array,
      default: [],
    },
    refreshToken: {
      type: String,
      require: true,
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

//Export the model
module.exports = model(DOCUMENT_NAME, tokenKeySchema);
