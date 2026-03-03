const success = (res, data = null, message = 'Success', status = 200, meta) => {
  const payload = { success: true, data, message };
  if (meta && typeof meta === 'object') {
    payload.meta = meta;
  }
  return res.status(status).json(payload);
};

const error = (res, message = 'Error', status = 500, meta) => {
  const payload = { success: false, data: null, message };
  if (meta && typeof meta === 'object') {
    payload.meta = meta;
  }
  return res.status(status).json(payload);
};

module.exports = {
  success,
  error,
};
