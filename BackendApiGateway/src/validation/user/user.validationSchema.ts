import z from "zod";
import { UserType } from "../../data/models/generated/prisma/enums.ts";
import { USER_ERRORS } from "../../lang/en.ts";

export const UpdateUserSchema = z.object({
  email:                z.email(USER_ERRORS.INVALID_EMAIL).optional(),
  // password:             z.string().optional(),
  userType:             z.enum([UserType.REG_USER, UserType.ADMIN], USER_ERRORS.INVALID_USER_TYPE).optional(),
  apiServiceCallLimit:  z.number().optional()
});


//todo (if time)
// export const CreateUserSchema = z.object({
//   email: z.email({
//     error: (issue) => {
//       return issue.input === undefined 
//         ? AUTH_ERRORS.EMPTY_EMAIL_ERROR
//         : USER_ERRORS.INVALID_EMAIL;
//     }
//   }),
//   hashedPassword: z.string({
//     error: (issue) => {
//       return issue.input === undefined 
//         ? AUTH_ERRORS.EMPTY_PASSWORD_ERROR 
//         : undefined;
//     }
//   })
//   .min(1, { error: AUTH_ERRORS.EMPTY_PASSWORD_ERROR })
// });
