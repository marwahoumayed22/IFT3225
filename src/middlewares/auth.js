const Device = require('../models/Device');
const { sendError } = require('../utils/response');

async function requireApiKey(req, res, next) {
  try {
    const apiKey = req.header('x-api-key');

    if (!apiKey) {
      return sendError(res, 401, 'MISSING_API_KEY', "L'en-tête x-api-key est requis pour cette opération.");
    }

    const device = await Device.findOne({ apiKey });

    if (!device) {
      return sendError(res, 403, 'INVALID_API_KEY', "La clé API fournie ne correspond à aucun device enregistré.");
    }

    req.device = device;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = requireApiKey;
