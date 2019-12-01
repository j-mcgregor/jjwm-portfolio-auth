export const assembleToken = ({ COOKIE_1, COOKIE_2 }) =>
  !COOKIE_1 || !COOKIE_2
    ? new Error('Invalid cookies object')
    : `${COOKIE_1}.${COOKIE_2}`;
