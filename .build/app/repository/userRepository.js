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
const dbOperation_1 = require("./dbOperation");
class UserRepository extends dbOperation_1.DBOperation {
    constructor() {
        super();
    }
    createAccount({ email, password, salt, phone, userType }) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkEmail = yield this.executeQuery("SELECT * FROM users WHERE email = $1", [email]);
            if (checkEmail.rowCount > 0) {
                throw new Error("This email already exists.");
            }
            const stringQuery = "INSERT INTO users (email, password, salt, phone, user_type) VALUES ($1, $2, $3, $4, $5) RETURNING *";
            const values = [email, password, salt, phone, userType];
            const result = yield this.executeQuery(stringQuery, values);
            if (result.rowCount > 0) {
                return result.rows[0];
            }
        });
    }
    findAccount(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const stringQuery = "SELECT user_id,phone,email,password,salt,verification_code, expiry FROM users WHERE email = $1";
            const result = yield this.executeQuery(stringQuery, [email]);
            if (result.rowCount < 1) {
                throw new Error("User not found");
            }
            return result.rows[0];
        });
    }
    updateVerificationCode(userID, code, expiry) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryString = "UPDATE users SET verification_code=$1, expiry=$2 WHERE user_id=$3 RETURNING *";
            const value = [code, expiry, userID];
            const result = yield this.executeQuery(queryString, value);
            if (result.rowCount > 0) {
                return result.rows[0];
            }
        });
    }
    updateVerifyUser(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryString = "UPDATE users SET verified=TRUE WHERE user_id=$1 RETURNING *";
            const value = [userID];
            const result = yield this.executeQuery(queryString, value);
            if (result.rowCount > 0) {
                return result.rows[0];
            }
            throw new Error("User already verified!");
        });
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=userRepository.js.map