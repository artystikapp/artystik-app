// app/api/razorpay/webhook/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

import { RAZORPAY_EVENT_TYPES } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    // Read the raw request body as text for signature verification
    const payload = await request.text();
    // Extract the signature from Razorpay's headers
    const receivedSignature = request.headers.get("x-razorpay-signature");

    if (!receivedSignature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Recompute the signature using your webhook secret from environment variables & sent payload
    const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

    const expectedSignature = crypto
      .createHmac("sha256", razorpayWebhookSecret)
      .update(payload)
      .digest("hex");

    // Compare the signatures to validate the webhook
    if (expectedSignature !== receivedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Now that the signature is verified, parse the payload
    const razorpayWebhookEvent = JSON.parse(payload);
    console.log(
      "💰 Razorpay webhook event:",
      JSON.stringify(razorpayWebhookEvent, null, 2)
    );

    // Extract the event type; it could be payment events or refund events
    const eventType: string = razorpayWebhookEvent.event;

    // Example: extract the order id or other relevant identifiers from the payload
    // Adjust this extraction according to Razorpay's payload structure.
    const paymentEntity = razorpayWebhookEvent.payload?.payment?.entity;
    const razorpayOrderId = paymentEntity?.order_id; // For payment events

    // Process the webhook event based on event type
    switch (eventType) {
      case RAZORPAY_EVENT_TYPES.PAYMENT_CAPTURED:
        console.log(
          "💰Razorpay Webhook: Payment captured. Updating order as 'paid'. ",
          razorpayOrderId
        );
        // Example: update your internal order record to 'paid'
        // await prisma.order.update({
        //   where: { razorpayOrderId },
        //   data: { status: "paid" },
        // });
        break;

      case RAZORPAY_EVENT_TYPES.PAYMENT_FAILED:
        console.log(
          "💰Razorpay Webhook: Payment failed. Updating order as 'failed'. ",
          razorpayOrderId
        );
        // Example: update your internal order record to 'failed'
        // await prisma.order.update({
        //   where: { razorpayOrderId },
        //   data: { status: "failed" },
        // });
        break;

      case RAZORPAY_EVENT_TYPES.REFUND_PROCESSED:
        console.log(
          "💰Razorpay Webhook: Refund processed. Updating order as 'refunded'. ",
          razorpayOrderId
        );
        // Example: update your internal order record to 'refunded'
        // await prisma.order.update({
        //   where: { razorpayOrderId },
        //   data: { status: "refunded" },
        // });
        break;

      default:
        console.log(`💰Razorpay Webhook: Unhandled event type: ${eventType}`);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error: Error | unknown) {
    console.error("razorpay webhook error:", error);
    return NextResponse.json(
      { error: "razorpay webhook handler failed" },
      { status: 500 }
    );
  }
}
