
import * as z from "zod";

export const SignInSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

export const SignUpSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
    country: z.string().min(1, { message: "Please select a country." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const ForgotPasswordSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

export const ApprovalRuleSchema = z.object({
  userId: z.string().min(1, { message: "Please select a user." }),
  ruleTitle: z.string().min(3, { message: "Rule title must be at least 3 characters." }),
  manager: z.string().min(1, { message: "Please select a manager." }),
  approvers: z.array(z.object({
    name: z.string().min(1, { message: "Please select an approver." }),
    required: z.boolean(),
  })).min(1, { message: "At least one approver is required." }),
  isManagerApprover: z.boolean(),
  approversSequence: z.boolean(),
  minApprovalPercentage: z.number().min(1).max(100),
});
