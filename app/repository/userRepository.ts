import { UserModel } from "../models/dto/UserModel";
import { DBClient } from "../util/dbClient";

export class UserRepository {
  constructor() {}

  async createAccount({ email, password, salt, phone, userType }: UserModel) {
    const client = await DBClient();
    await client.connect();
    const result = await client.query(
      `INSERT INTO users (email, password, salt, phone, user_type) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [email, password, salt, phone, userType]
    );
      await client.end();
      if(result.rowCount > 0) {
        return result.rows[0] as UserModel;
      }
  }
}
