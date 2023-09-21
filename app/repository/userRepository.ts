import { UserModel } from "../models/UserModel";
import { DBClient } from "../util/dbClient";

export class UserRepository {
  constructor() {}

  async createAccount({ email, password, salt, phone, userType }: UserModel) {
    const client = await DBClient();
    await client.connect();

     const checkEmail = await client.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    if(checkEmail.rowCount > 0) {
      throw new Error("This email already exists.");
         
    }

    const result = await client.query(
      `INSERT INTO users (email, password, salt, phone, user_type) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [email, password, salt, phone, userType]
    );
      await client.end();
      if(result.rowCount > 0) {
        return result.rows[0] as UserModel;
      }
  }

  async findAccount(email:string){
    const client = await DBClient(); 
    await client.connect();
    const result = await client.query(
      `SELECT user_id,phone,email,password,salt FROM users WHERE email = $1`,
      [email]
    );
    await client.end();
    if(result.rowCount < 1) {
      throw new Error("User not found");
    }
    return result.rows[0] as UserModel;
  }
}
