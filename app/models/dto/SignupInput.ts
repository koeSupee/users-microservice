import { Length } from "class-validator";
import { LoginInput } from "./LoginInput";

export class SignupInput extends LoginInput {
  // ตรวจสอบข้อมูลที่มาจากแหล่งต่างๆตรงตามเงื่อนไขหรือไม่
  @Length(10, 13)
  phone: string;
}
