import { APIGatewayProxyEventV2 } from "aws-lambda";
import { SuccessResponse, ErrorResponse } from "../util/response";
import { UserRepository } from "../repository/userRepository";
import { autoInjectable } from "tsyringe";
import { plainToClass } from "class-transformer";
import { SignupInput } from "../models/dto/SignupInput";
import { AppValidatoinError } from "../util/errors";
import { GetSalt, GetHashedPassword } from "../util/password";

@autoInjectable()
export class UserService {
  repository: UserRepository;
  constructor(repository: UserRepository) {
    this.repository = repository;
  }

  //User
  async CreateUser(event: APIGatewayProxyEventV2) {

    try {
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
    return SuccessResponse({ message: "response from User login" });
  }

  async VerifyUser(event: APIGatewayProxyEventV2) {
    return SuccessResponse({ message: "response from verify User" });
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
