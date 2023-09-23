"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
exports.UserService = void 0;
const response_1 = require("../util/response");
const userRepository_1 = require("../repository/userRepository");
const tsyringe_1 = require("tsyringe");
const class_transformer_1 = require("class-transformer");
const SignupInput_1 = require("../models/dto/SignupInput");
const LoginInput_1 = require("../models/dto/LoginInput");
const UpdateInput_1 = require("../models/dto/UpdateInput");
const errors_1 = require("../util/errors");
const password_1 = require("../util/password");
const notification_1 = require("../util/notification");
const dateHelper_1 = require("../util/dateHelper");
let UserService = class UserService {
    constructor(repository) {
        this.repository = repository;
    }
    ResponeWithError(event) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, response_1.ErrorResponse)(404, "request method not supported");
        });
    }
    //User
    CreateUser(event) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // แปลง JSON เป็นอ็อบเจ็กต์ของคลาส SignupInput
                const input = (0, class_transformer_1.plainToClass)(SignupInput_1.SignupInput, event.body);
                const error = yield (0, errors_1.AppValidatoinError)(input);
                if (error)
                    return (0, response_1.ErrorResponse)(404, error);
                const salt = yield (0, password_1.GetSalt)();
                const hashedPassword = yield (0, password_1.GetHashedPassword)(input.password, salt);
                const data = yield this.repository.createAccount({
                    email: input.email,
                    password: hashedPassword,
                    phone: input.phone,
                    userType: "BUYER",
                    salt: salt,
                });
                return (0, response_1.SuccessResponse)({ data });
            }
            catch (error) {
                console.log(error);
                return (0, response_1.ErrorResponse)(500, error);
            }
        });
    }
    UserLogin(event) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // แปลง JSON เป็นอ็อบเจ็กต์ของคลาส LoginInput
                const input = (0, class_transformer_1.plainToClass)(LoginInput_1.LoginInput, event.body);
                const error = yield (0, errors_1.AppValidatoinError)(input);
                if (error)
                    return (0, response_1.ErrorResponse)(404, error);
                const data = yield this.repository.findAccount(input.email);
                const verified = yield (0, password_1.ValidatePassword)(input.password, data.password, data.salt);
                if (!verified) {
                    throw new Error("password does not match!");
                }
                const token = (0, password_1.GetToken)(data);
                return (0, response_1.SuccessResponse)({ token });
            }
            catch (error) {
                console.log(error);
                return (0, response_1.ErrorResponse)(500, error);
            }
        });
    }
    GetVerificationToken(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = event.headers.authorization;
            if (!token)
                return (0, response_1.ErrorResponse)(500, "Invalid authorization");
            const payload = yield (0, password_1.VerifyToken)(token);
            if (!payload)
                return (0, response_1.ErrorResponse)(403, "Authorization failed!");
            const { code, expiry } = (0, notification_1.GenerateAccessCode)();
            yield this.repository.updateVerificationCode(payload.user_id, code, expiry);
            yield (0, notification_1.SendVerificationCode)(code, payload.phone);
            console.log(code, expiry);
            return (0, response_1.SuccessResponse)({
                message: "verification code is sent to your registered mobile number!",
            });
        });
    }
    VerifyUser(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = event.headers.authorization;
            if (!token)
                return (0, response_1.ErrorResponse)(500, "Invalid authorization");
            const payload = yield (0, password_1.VerifyToken)(token);
            if (!payload)
                return (0, response_1.ErrorResponse)(403, "Authorization failed!");
            const input = (0, class_transformer_1.plainToClass)(UpdateInput_1.VerificationInput, event.body);
            const error = yield (0, errors_1.AppValidatoinError)(input);
            if (error)
                return (0, response_1.ErrorResponse)(404, error);
            const { verification_code, expiry } = yield this.repository.findAccount(payload.email);
            return (0, response_1.SuccessResponse)({ message: "user verify!" });
            if (verification_code === parseInt(input.code)) {
                // check expire
                const currentTime = new Date();
                const diff = (0, dateHelper_1.TimeDifference)(expiry, currentTime.toISOString(), "m");
                if (diff > 0) {
                    console.log("verified successfully");
                    yield this.repository.updateVerifyUser(payload.user_id);
                    // update on db
                }
                else {
                    return (0, response_1.ErrorResponse)(403, "Verification code expired!");
                }
            }
        });
    }
    //User Profile
    CreateProfile(event) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, response_1.SuccessResponse)({ message: "response from Create User Profile" });
        });
    }
    GetProfile(event) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, response_1.SuccessResponse)({ message: "response from Get User Profile" });
        });
    }
    EditProfile(event) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, response_1.SuccessResponse)({ message: "response from Edit User Profile" });
        });
    }
    // Cart
    CreateCart(event) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, response_1.SuccessResponse)({ message: "response from Create Cart" });
        });
    }
    GetCart(event) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, response_1.SuccessResponse)({ message: "response from Get Cart" });
        });
    }
    UpdateCart(event) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, response_1.SuccessResponse)({ message: "response from Update Cart" });
        });
    }
    // Payments
    CreatePayment(event) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, response_1.SuccessResponse)({ message: "response from Create Payment method" });
        });
    }
    GetPayment(event) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, response_1.SuccessResponse)({ message: "response from Get Payment method" });
        });
    }
    UpdatePayment(event) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, response_1.SuccessResponse)({ message: "response from Udate Payment method" });
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, tsyringe_1.autoInjectable)(),
    __metadata("design:paramtypes", [userRepository_1.UserRepository])
], UserService);
//# sourceMappingURL=userService.js.map