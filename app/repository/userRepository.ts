import { UserModel } from "../models/dto/UserModel";

export class UserRepository {
  constructor() {}

  async createAccount({ email, password, salt, phone, userType }: UserModel) {}
}
