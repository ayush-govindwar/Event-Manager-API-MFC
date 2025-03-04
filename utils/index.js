//to export all files at once 
const { createJWT, isTokenValid, attachCookiesToResponse } = require('./jwt');
const createTokenUser = require('./createTokenUser');
const sendVerificationEmail = require('./sendVerficationEmail');
const sendCancellationEmail = require('./sendCancellationEmail');
const sendUpdatesEmail = require('./sendUpdatesEmail');
const createHash = require('./createHash');

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
  createHash,
  sendUpdatesEmail,
  sendCancellationEmail
};
