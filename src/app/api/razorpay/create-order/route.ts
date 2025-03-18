// app/api/razorpay/create-order/route.ts
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { z } from "zod";

// Initialize Razorpay instance with your secret key from environment variables
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, // public key for client, but this is used only for creating the order
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Define a Zod schema for the incoming request
const createOrderSchema = z.object({
  amount: z.number().positive(),
  cart: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      price: z.string(),
    })
  ),
  // You can add more fields if needed (like currency, receipt, etc.)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the incoming data with Zod
    const { amount, cart } = createOrderSchema.parse(body);

    // TODO validate cart items for price and availability from the DB
    // maybe save them to a cart table

    // Prepare options for the order creation.
    const options = {
      amount: amount * 100, // Amount in paise (multiply rupees by 100)
      currency: "INR", // Currency for the transaction
      receipt: `receipt_${Date.now()}`, // A unique receipt identifier (placeholder)
      payment_capture: 1, // 1 for auto-capture; 0 for manual capture
      notes: {
        user: "user_id_123",
        details: JSON.stringify(cart),
      },
    };

    console.log(
      "💳 Razorpay Order OPTIONS to be sent to Razorpay: ",
      JSON.stringify(
        {
          amount: options.amount,
          currency: options.currency,
          notes: options.notes,
        },
        null,
        2
      )
    );

    // Create the order using Razorpay SDK
    const order = await razorpay.orders.create(options);

    // TODO: save the order to the database
    console.log("💳 Razorpay Order created!: ", JSON.stringify(order, null, 2));

    // Return the order details to the client
    // better pass down only DB details we want show in the UI
    // for now sending the razorpay order details
    return NextResponse.json({ order });
  } catch (error: Error | unknown) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Order creation failed" },
      { status: 500 }
    );
  }
}
