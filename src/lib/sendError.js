/* eslint-disable consistent-return */
export default (next, res, err, status) => {
  if (res.headersSent) {
    return next(err);
  }
  res.json({ errors: { [err.key]: err.message } });
  res.status(status);
};
