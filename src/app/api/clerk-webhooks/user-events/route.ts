// app/api/clerk-webhooks/user-events/route.ts
import { NextResponse } from "next/server";
import { Webhook } from "svix";

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET || "";

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
    let verifiedPayload: any;
    try {
      verifiedPayload = wh.verify(payload, svixHeaders);
    } catch (err) {
      console.error("❌ Invalid Clerk webhook signature:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 3. Grab the event type and data
    //    Typically: { object: 'event', type: 'user.created' | 'user.updated' | 'user.deleted', data: {...} }
    const { type, data } = verifiedPayload;

    // 4. Switch on event type
    switch (type) {
      // -----------------------------
      // user.created
      // -----------------------------
      case "user.created": {
        const { id } = data;
        // Safely extract email (might be empty array)
        const primaryEmail = data.email_addresses?.[0]?.email_address ?? null;
        // Safely extract names (might be undefined/null)
        const firstName = data.first_name ?? null;
        const lastName = data.last_name ?? null;

        console.log("✅ [user.created]", {
          id,
          primaryEmail,
          firstName,
          lastName,
        });

        // Example DB insert with only guaranteed and optional fields
        // await db.user.create({
        //   data: {
        //     userId: id,           // Always present
        //     email: primaryEmail,  // Might be null
        //     firstName,           // Might be null
        //     lastName,            // Might be null
        //     // Custom fields you'll collect later
        //     address: null,
        //     phone: null,
        //   }
        // });

        break;
      }

      // -----------------------------
      // user.updated
      // -----------------------------
      case "user.updated": {
        const { id } = data;
        const primaryEmail = data.email_addresses?.[0]?.email_address ?? null;
        const firstName = data.first_name ?? null;
        const lastName = data.last_name ?? null;

        console.log("✅ [user.updated]", {
          id,
          primaryEmail,
          firstName,
          lastName,
        });

        // await db.user.update({
        //   where: { userId: id },
        //   data: {
        //     email: primaryEmail,
        //     firstName,
        //     lastName,
        //   }
        // });

        break;
      }

      // -----------------------------
      // user.deleted
      // -----------------------------
      case "user.deleted": {
        const { id } = data;

        console.log("✅ [user.deleted]", { id });
        // TODO: Delete or mark user as inactive in your DB
        // e.g.
        // await db.user.delete({ where: { userId: id } });

        break;
      }

      default:
        console.log("ℹ️ [Unhandled event type]", type);
      // Optionally return 400 if you want to fail on unknown types
      // return NextResponse.json({ error: "Unhandled event" }, { status: 400 });
    }

    // 5. Return success
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
