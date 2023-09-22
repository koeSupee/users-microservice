import { UserModel } from "../models/UserModel";
import { DBOperation } from "./dbOperation";

export class UserRepository extends DBOperation {
  constructor() {
    super();
  }

  async createAccount({ email, password, salt, phone, userType }: UserModel) {

    const checkEmail = await this.executeQuery("SELECT * FROM users WHERE email = $1",[email]);
 
    if(checkEmail.rowCount > 0) {
      throw new Error("This email already exists.");  
    }
    const stringQuery = "INSERT INTO users (email, password, salt, phone, user_type) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    const values = [email, password, salt, phone, userType];
    const result = await this.executeQuery(stringQuery,values);
      if(result.rowCount > 0) {
        return result.rows[0] as UserModel;
      }
  }

  async findAccount(email:string){

    const stringQuery = "SELECT user_id,phone,email,password,salt FROM users WHERE email = $1";

    const result = await this.executeQuery(stringQuery,[email]);

    if(result.rowCount < 1) {
      throw new Error("User not found");
    }
    return result.rows[0] as UserModel;
  }

  async updateVerificationCode(userID: string, code: number, expiry: Date) {
    
    const queryString = "UPDATE users SET verification_code=$1, expiry=$2 WHERE user_id=$3 RETURNING *";
    const value = [code, expiry, userID];
    const result = await this.executeQuery(queryString, value);
    if(result.rowCount > 0) {
      return result.rows[0] as UserModel;
    }
    
  }
}
