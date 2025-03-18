// app/cart/page.tsx
"use client";

import { useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { formatCartDescription } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

// Declare Razorpay on the Window interface
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

// Define the type for Razorpay options
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  image?: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
}

// Define the type for Razorpay instance
interface RazorpayInstance {
  open: () => void;
}

// Define the type for Razorpay payment response
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const orderResponseSchema = z.object({
  order: z.object({
    id: z.string(),
  }),
  razorpay: z.object({
    id: z.string(),
    amount: z.union([z.number(), z.string()]),
    currency: z.string(),
  }),
  user: z.object({
    name: z.string(),
    email: z.string().email(),
    // contact: z.string().optional() // Uncomment if you add phone numbers
  }),
});

export default function CartPage() {
  const amount = 200;

  // better to have this only critical details
  const cartPayload = [
    { id: "product_id_99", title: "Product 99", price: "150.00" },
    { id: "product_id_100", title: "Product 100", price: "50.00" },
  ];

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const router = useRouter();

  const handleScriptLoad = () => {
    setScriptLoaded(true);
    console.log("Razorpay script loaded");
  };

  const handleProceedToBuy = async () => {
    console.log("Proceed to Buy clicked with amount:", amount);

    try {
      // Create order via your API
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        body: JSON.stringify({ amount, cart: cartPayload }),
      });

      const createOrderData = await res.json();

      // Validate the response with Zod
      const validatedData = orderResponseSchema.parse(createOrderData);
      console.log("💳 Validated Razorpay Order: ", validatedData);

      if (validatedData.razorpay.id) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
          order_id: validatedData.razorpay.id,
          amount: Number(validatedData.razorpay.amount),
          currency: validatedData.razorpay.currency,

          // branding details
          name: APP_NAME,
          // logo: "/logo.png",
          theme: {
            color: "#F37254",
          },

          // description of the cart
          description: formatCartDescription(cartPayload),

          // prefill details
          prefill: {
            name: validatedData.user.name,
            email: validatedData.user.email,
            // contact: validatedData.user.contact,
          },

          // notes, for razorpay records
          notes: {
            orderId: validatedData.order.id,
            details: JSON.stringify(cartPayload),
          },

          // payment success handler
          handler: function (response: RazorpayResponse) {
            console.log("Payment successful:", response);
            router.push(`/payment/success?orderId=${validatedData.order.id}`);
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error: Error | unknown) {
      console.error("Error creating order:", error);
      // Show error to user
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Cart Page</h1>
      <p className="text-lg mb-6">
        Total Amount: <span className="font-semibold">₹{amount}</span>
      </p>

      <Script
        src={process.env.NEXT_PUBLIC_RAZORPAY_SCRIPT_URL || ""}
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />

      <Button
        onClick={handleProceedToBuy}
        disabled={!scriptLoaded}
        className={`w-full py-3 px-6 rounded-md transition-colors focus:outline-none ${
          scriptLoaded
            ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            : "bg-gray-400 text-gray-700 cursor-not-allowed"
        }`}
      >
        {scriptLoaded ? "Proceed to Buy" : "Loading Payment Gateway..."}
      </Button>
    </div>
  );
}
