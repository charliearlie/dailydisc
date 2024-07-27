import { z } from "zod";

export const LoginFormSchema = z.object({
  username: z.string(),
  password: z.string().min(8),
});

export const SignUpFormSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8),
});

const MAX_FILE_SIZE = 1024 * 1024 * 2;

export const FileSchema = z.any().refine((file) => {
  return !file || file?.size <= MAX_FILE_SIZE;
}, `Max file size is 5MB.`);
