"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  Schema
} = _mongoose.default;
const UserSchema = new Schema({
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  dob: {
    type: Date
  },
  email: {
    type: String
  },
  password: {
    type: String
  }
});

var _default = _mongoose.default.model('users', UserSchema);

exports.default = _default;
//# sourceMappingURL=User.js.map