const crypto = require('crypto');

function generateApiKey() {
  return crypto.randomBytes(24).toString('hex');
}

module.exports = { generateApiKey };
