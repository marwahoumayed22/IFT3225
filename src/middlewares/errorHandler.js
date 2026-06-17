const { sendError } = require('../utils/response');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'ValidationError') {
    return sendError(res, 400, 'VALIDATION_ERROR', 'Les données fournies sont invalides.', err.errors);
  }

  if (err.name === 'CastError') {
    return sendError(res, 400, 'INVALID_ID', 'Identifiant invalide.');
  }

  return sendError(res, 500, 'INTERNAL_ERROR', 'Une erreur interne est survenue.');
}

module.exports = errorHandler;
