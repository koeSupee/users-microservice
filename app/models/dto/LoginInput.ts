import { IsEmail, Length } from "class-validator";

export class LoginInput {
  // ตรวจสอบข้อมูลที่มาจากแหล่งต่างๆตรงตามเงื่อนไขหรือไม่
  @IsEmail()
  email!: string;
  @Length(6, 30)
  password!: string;
}
