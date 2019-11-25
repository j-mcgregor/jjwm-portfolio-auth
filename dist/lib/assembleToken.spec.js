"use strict";

var _assembleToken = _interopRequireDefault(require("./assembleToken"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('assembleToken', () => {
  it('should create a token from 2 cookies', () => {
    const cookies = {
      COOKIE_1: 'header.payload',
      COOKIE_2: 'signature'
    };
    const token = (0, _assembleToken.default)(cookies);
    expect(token).toBe('header.payload.signature');
  });
});
//# sourceMappingURL=assembleToken.spec.js.map