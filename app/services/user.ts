import bcrypt from "bcryptjs";
import { and, count, eq, not, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/drizzle/db.server";
import { reviews, users } from "~/drizzle/schema.server";
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

export const getUserByUsername = async (username: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username));

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

export const getUserReviewCount = async (userId?: number) => {
  if (!userId) return 0;
  const [response] = await db
    .select({ count: count() })
    .from(reviews)
    .where(and(eq(reviews.userId, userId), not(eq(reviews.albumId, 194))));

  return response.count;
}
