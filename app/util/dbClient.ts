import { Client } from "pg";
import dotenv from "dotenv";
dotenv.config();

export const DBClient = ()=>{
    return new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.PASSWORD,
        port: parseInt(process.env.DB_PORT || '5432'),
    })
}

