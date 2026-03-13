function sendSuccess(res, data = null, statusCode = 200) {
  return res.status(statusCode).json({
    status: 1,
    data,
    error: null,
  });
}

function sendError(res, statusCode, error, data = null) {
  return res.status(statusCode).json({
    status: 0,
    data,
    error,
  });
}

module.exports = {
  sendSuccess,
  sendError,
};
