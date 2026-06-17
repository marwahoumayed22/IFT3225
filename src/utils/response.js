function sendSuccess(res, status, data, meta) {
  const body = { data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}

function sendError(res, status, code, message, details) {
  const body = { error: { code, message } };
  if (details) body.error.details = details;
  return res.status(status).json(body);
}

module.exports = { sendSuccess, sendError };
