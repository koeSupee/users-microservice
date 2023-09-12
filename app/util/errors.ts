import { ValidationError, validate } from "class-validator";

export const AppValidatoinError = async (
  input: any
): Promise<ValidationError[] | false> => {
  const error = await validate(input, {
    AppValidatorErrora: { target: true },
  });
  if (error.length) {
    return error;
  }
  return false;
};
