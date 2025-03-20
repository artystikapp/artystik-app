// app/api/razorpay/create-order/route.ts
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { PRODUCT_STATUS, CURRENCY, ORDER_STATUS } from "@/lib/constants";
import { OrderStatus } from "@prisma/client";

import { auth } from "@clerk/nextjs/server";

// Initialize Razorpay instance with your secret key from environment variables
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!, // public key for client, but this is used only for creating the order
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Define a Zod schema for the incoming request
const createOrderSchema = z.object({
  amount: z.number().positive(),
  cart: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        image: z.string().optional(),
        price: z.string(), // send price in paise
      })
    )
    .min(1, "Cart must contain at least one item"),
  // You can add more fields if needed (like currency, receipt, etc.)
});

export async function POST(request: Request) {
  try {
    // Retrieve authenticated user details from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate the user in the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const body = await request.json();

    // Validate the incoming data with Zod
    const { amount, cart } = createOrderSchema.parse(body);

    // Validate cart items for price and availability from the DB
    // Extract product IDs from the cart
    const cartProductIds = cart.map((item) => item.id);

    // Fetch all products from the DB in one call
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: cartProductIds } },
    });

    // Validate cart items against fetched products
    for (const cartItem of cart) {
      const dbProduct = dbProducts.find((p) => p.id === cartItem.id);

      if (!dbProduct) {
        throw new Error(`Product not found: ${cartItem.id}`);
      }

      // Convert cart price (string) to integer for comparison
      const cartPrice = parseInt(cartItem.price, 10);

      if (dbProduct.price !== cartPrice) {
        throw new Error(`Price mismatch for product ${cartItem.id}`);
      }

      if (dbProduct.status !== PRODUCT_STATUS.AVAILABLE) {
        throw new Error(`Product ${cartItem.id} is not available`);
      }
    }

    // Validate that the total amount matches the sum of cart item prices.
    const expectedAmount = cart.reduce(
      (sum, item) => sum + parseInt(item.price, 10),
      0
    );

    if (expectedAmount !== amount) {
      throw new Error(
        `Total amount mismatch: expected ${expectedAmount} paise, but got ${amount}`
      );
    }

    const receiptValue = `receipt_artk_${Date.now()}_${uuidv4()}`;

    // Prepare options for the order creation.
    const options = {
      amount: amount, // Amount in paise
      currency: CURRENCY.INR, // Currency for the transaction
      receipt: receiptValue, // A unique receipt identifier (placeholder)
      payment_capture: 1, // 1 for auto-capture; 0 for manual capture
      notes: {
        user: userId,
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
          receipt: options.receipt,
        },
        null,
        2
      )
    );

    // Create the order using Razorpay SDK
    const razorpayOrder = await razorpay.orders.create(options);

    // TODO: save the order to the database
    console.log(
      "💳 Razorpay Order created!: ",
      JSON.stringify(razorpayOrder, null, 2)
    );

    // Save the order to the database
    const internalOrder = await prisma.order.create({
      data: {
        user_id: userId, // Replace with the actual user ID from your auth context
        razorpay_order_id: razorpayOrder.id, // Razorpay's unique order ID
        razorpay_receipt: receiptValue, // The receipt value sent to Razorpay (merchant-defined)
        amount: parseInt(String(razorpayOrder.amount), 10), // Convert to string first, then parse
        currency: razorpayOrder.currency, // e.g., "INR"
        status: ORDER_STATUS.PENDING as OrderStatus, // Use the enum string value directly to match Prisma schema
      },
    });

    // Construct the response payload
    const payload = {
      order: {
        id: internalOrder.id, // internal order ID for success page routing
      },
      razorpay: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      user: {
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        email: user.email,
        // Uncomment below if phone exists: contact: user.phone,
      },
    };

    console.log(
      "💳 Razorpay Order response payload: ",
      JSON.stringify(payload, null, 2)
    );

    return NextResponse.json(payload);
  } catch (error: Error | unknown) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Order creation failed" },
      { status: 500 }
    );
  }
}
