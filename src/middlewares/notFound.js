const { sendError } = require('../utils/response');

function notFound(req, res) {
  return sendError(res, 404, 'NOT_FOUND', `La ressource ${req.method} ${req.originalUrl} n'existe pas.`);
}

module.exports = notFound;
