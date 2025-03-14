// app/api/clerk-webhooks/user-events/route.ts
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import prisma from "@/lib/prisma";

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || "";

export const WebhookEventTypes = {
  // User events
  USER_CREATED: "user.created",
  USER_UPDATED: "user.updated",
  USER_DELETED: "user.deleted",
  USER_SIGNED_IN: "user.signed_in",
  USER_SIGNED_OUT: "user.signed_out",
  // ... other events can be added here
} as const;

// Make the type more flexible
type WebhookEventType =
  | `user.${string}`
  | (typeof WebhookEventTypes)[keyof typeof WebhookEventTypes];

interface WebhookEvent {
  type: WebhookEventType; // Now accepts any user.* event
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string | null;
    last_name?: string | null;
    created_at: number; // Unix timestamp in seconds
    updated_at: number; // Unix timestamp in seconds
    // ... other potential fields
  };
}

export async function POST(request: Request) {
  try {
    // 1. Get raw payload and headers for verification
    const payload = await request.text();
    const headers = Object.fromEntries(request.headers.entries());
    const svixHeaders = {
      "svix-id": headers["svix-id"],
      "svix-timestamp": headers["svix-timestamp"],
      "svix-signature": headers["svix-signature"],
    };

    // 2. Verify using svix + Clerk secret
    const wh = new Webhook(WEBHOOK_SECRET);
    let verifiedPayload: WebhookEvent;
    try {
      verifiedPayload = wh.verify(payload, svixHeaders) as WebhookEvent;
    } catch (err) {
      console.error("❌ Invalid Clerk webhook signature:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 3. Grab the event type and data
    //    Typically: { object: 'event', type: 'user.created' | 'user.updated' | 'user.deleted', data: {...} }
    const { type, data } = verifiedPayload;

    // Cleaner switch statement
    switch (type) {
      case WebhookEventTypes.USER_CREATED:
        await handleUserCreated(data);
        break;
      case WebhookEventTypes.USER_UPDATED:
        await handleUserUpdated(data);
        break;
      case WebhookEventTypes.USER_DELETED:
        await handleUserDeleted(data);
        break;
      default:
        console.log("ℹ️ [Unhandled event type]", type);
    }

    // 5. Return success
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Handler functions
async function handleUserCreated(data: WebhookEvent["data"]) {
  const { id } = data;
  const primaryEmail = data.email_addresses?.[0]?.email_address ?? null;
  const firstName = data.first_name ?? null;
  const lastName = data.last_name ?? null;
  const createdAt = data.created_at;

  console.log("✅ [user.created]", {
    id,
    primaryEmail,
    firstName,
    lastName,
    createdAt,
  });

  await prisma.user.create({
    data: {
      id: id,
      email: primaryEmail ?? "",
      firstName: firstName ?? "",
      lastName: lastName ?? "",
    },
  });

  console.log(`✅ user created in DB successfully ${id}`);
}

async function handleUserUpdated(data: WebhookEvent["data"]) {
  const { id } = data;
  const primaryEmail = data.email_addresses?.[0]?.email_address ?? null;
  const firstName = data.first_name ?? null;
  const lastName = data.last_name ?? null;
  const createdAt = data.created_at;
  const updatedAt = data.updated_at;

  console.log("✅ [user.updated]", {
    id,
    primaryEmail,
    firstName,
    lastName,
    createdAt,
    updatedAt,
  });

  await prisma.user.update({
    where: { id },
    data: {
      email: primaryEmail ?? "",
      firstName: firstName ?? "",
      lastName: lastName ?? "",
    },
  });

  console.log(`✅ user updated in DB successfully ${id}`);
}

async function handleUserDeleted(data: WebhookEvent["data"]) {
  const { id } = data;
  console.log("✅ [user.deleted]", { id });

  await prisma.user.delete({ where: { id } });

  console.log(`✅ user deleted in DB successfully ${id}`);
}
