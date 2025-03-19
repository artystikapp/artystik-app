// app/cart/page.tsx
"use client";

import { useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { formatCartDescription } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useStore } from "@/store";

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
  const items = useStore((state) => state.items);
  const totalItems = useStore((state) => state.totalItems);
  const totalAmount = useStore((state) => state.totalAmount);
  const removeItem = useStore((state) => state.removeItem);
  const clearCart = useStore((state) => state.clearCart);

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const router = useRouter();

  const handleScriptLoad = () => {
    setScriptLoaded(true);
    console.log("Razorpay script loaded");
  };

  const handleProceedToBuy = async () => {
    if (items.length === 0) {
      console.log("Cart is empty");
      return;
    }

    console.log("Proceed to Buy clicked with amount:", totalAmount);

    try {
      // Create order via your API
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        body: JSON.stringify({
          // handle the amount conversion to paisa better later
          amount: Math.round(totalAmount * 100),
          cart: items,
        }),
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
          description: formatCartDescription(items),

          // prefill details
          prefill: {
            name: validatedData.user.name,
            email: validatedData.user.email,
            // contact: validatedData.user.contact,
          },

          // notes, for razorpay records
          notes: {
            orderId: validatedData.order.id,
            details: JSON.stringify(items),
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

      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-500 mb-4">Your cart is empty</p>
          <Button onClick={() => router.push("/products")} variant="outline">
            Continue Shopping
          </Button>
        </div>
      ) : (
        <>
          {/* Cart Items List */}
          <div className="border rounded-lg overflow-hidden mb-6">
            <div className="divide-y">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex justify-between items-center"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{item.title}</h3>
                    <p className="text-blue-600 font-semibold">₹{item.price}</p>
                  </div>
                  <Button
                    onClick={() => removeItem(item.id)}
                    variant="ghost"
                    size="icon"
                    className="text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="border rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span>Subtotal ({totalItems} items)</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
              <span>Total</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-6">
            <Button onClick={clearCart} variant="outline">
              Clear Cart
            </Button>
            <Button onClick={() => router.push("/products")} variant="outline">
              Continue Shopping
            </Button>
          </div>

          <Script
            src={process.env.NEXT_PUBLIC_RAZORPAY_SCRIPT_URL || ""}
            strategy="afterInteractive"
            onLoad={handleScriptLoad}
          />

          <Button
            onClick={handleProceedToBuy}
            disabled={!scriptLoaded || items.length === 0}
            className="w-full py-3 px-6 rounded-md transition-colors focus:outline-none"
          >
            {scriptLoaded
              ? "Proceed to Checkout"
              : "Loading Payment Gateway..."}
          </Button>
        </>
      )}
    </div>
  );
}
