export default (next, res, key, message, status) => {
  next(message);
  res.status(status).json({ errors: { [key]: message } });
};
