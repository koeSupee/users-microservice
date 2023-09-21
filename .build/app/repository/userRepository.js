"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const dbClient_1 = require("../util/dbClient");
class UserRepository {
    constructor() { }
    createAccount({ email, password, salt, phone, userType }) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield (0, dbClient_1.DBClient)();
            yield client.connect();
            const checkEmail = yield client.query(`SELECT * FROM users WHERE email = $1`, [email]);
            if (checkEmail.rowCount > 0) {
                throw new Error("This email already exists.");
            }
            const result = yield client.query(`INSERT INTO users (email, password, salt, phone, user_type) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [email, password, salt, phone, userType]);
            yield client.end();
            if (result.rowCount > 0) {
                return result.rows[0];
            }
        });
    }
    findAccount(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield (0, dbClient_1.DBClient)();
            yield client.connect();
            const result = yield client.query(`SELECT user_id,phone,email,password,salt FROM users WHERE email = $1`, [email]);
            yield client.end();
            if (result.rowCount < 1) {
                throw new Error("User not found");
            }
            return result.rows[0];
        });
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=userRepository.js.map