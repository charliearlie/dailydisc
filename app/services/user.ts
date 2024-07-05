import bcrypt from "bcryptjs";
import { count, eq, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/drizzle/db.server";
import { users } from "~/drizzle/schema.server";
import { LoginFormSchema, SignUpFormSchema } from "./schemas";

export const createUser = async (
  userForm: z.infer<typeof SignUpFormSchema>,
) => {
  const hashedPassword = await bcrypt.hash(userForm.password, 10);
  const [user] = await db
    .insert(users)
    .values({
      ...userForm,
      password: hashedPassword,
    })
    .returning({ id: users.id });

  return user.id;
};

export const getUserById = async (id: number) => {
  const [user] = await db.select().from(users).where(eq(users.id, id));

  return user;
};

export const areUserDetailsAvailable = async (
  email: string,
  username: string,
) => {
  const [usages] = await db
    .select({ count: count() })
    .from(users)
    .where(or(eq(users.email, email), eq(users.username, username)));

  return usages.count === 0;
};

export const login = async ({
  username,
  password,
}: z.infer<typeof LoginFormSchema>) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username.trim()));
  if (!user || !(await bcrypt.compare(password, user.password))) return null;

  return user;
};
