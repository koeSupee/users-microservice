import { APIGatewayProxyEventV2 } from "aws-lambda";
import { SuccessResponse, ErrorResponse } from "../util/response";
import { UserRepository } from "../repository/userRepository";
import { autoInjectable } from "tsyringe";
import { plainToClass } from "class-transformer";
import { SignupInput } from "../models/dto/SignupInput";
import { LoginInput } from "../models/dto/LoginInput";
import { VerificationInput } from "../models/dto/UpdateInput";
import { AppValidatoinError } from "../util/errors";
import { 
  GetSalt, 
  GetHashedPassword,
  ValidatePassword, 
  GetToken,
  VerifyToken 
} from "../util/password";
import {
  GenerateAccessCode,
  SendVerificationCode,
} from "../util/notification";
import { TimeDifference } from "../util/dateHelper";

@autoInjectable()
export class UserService {
  repository: UserRepository;
  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  async ResponeWithError(event: APIGatewayProxyEventV2){
    return ErrorResponse(404, "request method not supported");
  }
  
  //User
  async CreateUser(event: APIGatewayProxyEventV2) {

    try {
      // แปลง JSON เป็นอ็อบเจ็กต์ของคลาส SignupInput
      const input = plainToClass(SignupInput, event.body);
      const error = await AppValidatoinError(input);
      if (error) return ErrorResponse(404, error);
  
      const salt = await GetSalt();
      const hashedPassword = await GetHashedPassword(input.password, salt);
      const data = await this.repository.createAccount({
        email: input.email,
        password: hashedPassword,
        phone: input.phone,
        userType: "BUYER",
        salt: salt,
      });
  
      return SuccessResponse({data});
      
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async UserLogin(event: APIGatewayProxyEventV2) {
    
    try {
      // แปลง JSON เป็นอ็อบเจ็กต์ของคลาส LoginInput
      const input = plainToClass(LoginInput, event.body);
      const error = await AppValidatoinError(input);
      if (error) return ErrorResponse(404, error);

      const data = await this.repository.findAccount(input.email);
      const verified = await ValidatePassword(
        input.password,
        data.password,
        data.salt
      );
      if (!verified) {
        throw new Error("password does not match!");
      }
      const token = GetToken(data);
      return SuccessResponse({ token });
      
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async GetVerificationToken(event: APIGatewayProxyEventV2) {
    const token = event.headers.authorization;
    if(!token) return ErrorResponse(500,"Invalid authorization");

    const payload = await VerifyToken(token);
    if (!payload) return ErrorResponse(403, "Authorization failed!");
    
    const { code, expiry } = GenerateAccessCode();
    await this.repository.updateVerificationCode(payload.user_id!, code, expiry);
    await SendVerificationCode(code, payload.phone);
    console.log(code, expiry);
    return SuccessResponse({
      message: "verification code is sent to your registered mobile number!",
    });
  }

  async VerifyUser(event: APIGatewayProxyEventV2) {
    const token = event.headers.authorization;
    if(!token) return ErrorResponse(500,"Invalid authorization");

    const payload = await VerifyToken(token);
    if (!payload) return ErrorResponse(403, "Authorization failed!");
    const input = plainToClass(VerificationInput, event.body);
    const error = await AppValidatoinError(input);
    if (error) return ErrorResponse(404, error);

    const { verification_code, expiry } = await this.repository.findAccount(payload.email);
    return SuccessResponse({ message: "user verify!" });

    if(verification_code === parseInt(input.code)){
        // check expire
      const currentTime = new Date();
      const diff = TimeDifference(expiry, currentTime.toISOString(),"m");

      if(diff>0){
        console.log("verified successfully");
        await this.repository.updateVerifyUser(payload.user_id)
        // update on db
      }else{
        return ErrorResponse(403, "Verification code expired!");
      }
    }
  }

  //User Profile
  async CreateProfile(event: APIGatewayProxyEventV2) {
    return SuccessResponse({ message: "response from Create User Profile" });
  }

  async GetProfile(event: APIGatewayProxyEventV2) {
    return SuccessResponse({ message: "response from Get User Profile" });
  }

  async EditProfile(event: APIGatewayProxyEventV2) {
    return SuccessResponse({ message: "response from Edit User Profile" });
  }

  // Cart
  async CreateCart(event: APIGatewayProxyEventV2) {
    return SuccessResponse({ message: "response from Create Cart" });
  }

  async GetCart(event: APIGatewayProxyEventV2) {
    return SuccessResponse({ message: "response from Get Cart" });
  }

  async UpdateCart(event: APIGatewayProxyEventV2) {
    return SuccessResponse({ message: "response from Update Cart" });
  }

  // Payments
  async CreatePayment(event: APIGatewayProxyEventV2) {
    return SuccessResponse({ message: "response from Create Payment method" });
  }

  async GetPayment(event: APIGatewayProxyEventV2) {
    return SuccessResponse({ message: "response from Get Payment method" });
  }

  async UpdatePayment(event: APIGatewayProxyEventV2) {
    return SuccessResponse({ message: "response from Udate Payment method" });
  }
}
