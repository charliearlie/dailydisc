import { Honeypot, SpamError } from "remix-utils/honeypot/server";

export const honeypot = new Honeypot({
  randomizeNameFieldName: false,
  nameFieldName: "name__confirm",
  validFromFieldName: process.env.NODE_ENV === "production" ? undefined : null,
  encryptionSeed: process.env.HONEYPOT_SECRET,
});

export const checkForHoneypot = (formData: FormData) => {
  try {
    honeypot.check(formData);
  } catch (error) {
    if (error instanceof SpamError) {
      throw new Response("Go away spammer", { status: 400 });
    }
    throw error;
  }
};
