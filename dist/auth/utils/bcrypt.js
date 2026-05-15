"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodePassword = encodePassword;
exports.comparePasswords = comparePasswords;
const bcrypt = require("bcrypt");
function encodePassword(password) {
    const SALT = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, SALT);
}
function comparePasswords(password, hash) {
    return bcrypt.compareSync(password, hash);
}
//# sourceMappingURL=bcrypt.js.map