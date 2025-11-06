import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Webhook } from "svix";
import { createUserFromClerk } from "~/services/user.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const svix_id = request.headers.get("svix-id");
  const svix_timestamp = request.headers.get("svix-timestamp");
  const svix_signature = request.headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await request.text();
  const headers = {
    "svix-id": svix_id,
    "svix-timestamp": svix_timestamp,
    "svix-signature": svix_signature,
  };

  let evt: {
    type: string;
    data: {
      id: string;
      email_addresses?: Array<{ id: string; email_address: string }>;
      primary_email_address_id?: string;
      username?: string;
    };
  };
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    evt = wh.verify(payload, headers) as typeof evt;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
  console.log("Webhook body:", evt.data);

  switch (eventType) {
    case "user.created": {
      const { id: clerkId, email_addresses, username } = evt.data;
      
      if (!email_addresses || email_addresses.length === 0) {
        console.error("No email addresses found for user:", clerkId);
        return json({ error: "No email addresses found" }, { status: 400 });
      }

      const primaryEmail = email_addresses.find((email) => email.id === evt.data.primary_email_address_id);
      const email = primaryEmail?.email_address || email_addresses[0]?.email_address;

      if (!email) {
        console.error("No email address found for user:", clerkId);
        return json({ error: "No email address found" }, { status: 400 });
      }

      // Generate a username if none provided
      const finalUsername = username || email.split("@")[0] + Math.random().toString(36).substring(7);

      try {
        const user = await createUserFromClerk({
          clerkId,
          email,
          username: finalUsername,
        });
        
        console.log("Created user:", user);
        return json({ success: true, userId: user.id });
      } catch (error) {
        console.error("Error creating user:", error);
        return json({ error: "Failed to create user" }, { status: 500 });
      }
    }

    case "user.updated": {
      console.log("User updated - no action needed for now");
      return json({ success: true });
    }

    case "user.deleted": {
      console.log("User deleted - no action implemented yet");
      return json({ success: true });
    }

    default: {
      console.log(`Unhandled webhook event type: ${eventType}`);
      return json({ success: true });
    }
  }
}