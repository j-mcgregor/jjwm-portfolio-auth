export default (COOKIE_1, COOKIE_2) => {
  const [header, payload] = COOKIE_1.split('.');
  const [signature] = COOKIE_2.split('.');

  if (!header || !payload || !signature) {
    return '';
  }
  // console.log(`${header}.${payload}.${signature}`);

  const token = `${header}.${payload}.${signature}`;
  return token;
};
