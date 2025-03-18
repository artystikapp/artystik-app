// app/cart/page.tsx
"use client";

import { useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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

    // Create order via your API
    const res = await fetch("/api/razorpay/create-order", {
      method: "POST",
      body: JSON.stringify({ amount, cart: cartPayload }),
    });
    const data = await res.json();
    console.log("💳 Razorpay Order created: ", data);

    const order = data?.order;

    /**
     * !!! IMPORTANT !!!
     * send this order for payment to Razorpay only if our backend
     * has validated the cart items for price and availability
     * and returned a razorpay order id
     */

    if (order) {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "", // Use empty string as fallback
        amount: order.amount, // amount in paise, this comes from our backend from the razorpay.orders.create API response
        currency: order.currency, // this comes from our backend from the razorpay.orders.create API response
        name: "Artystik App",
        // image: "/logo.png", // Customize as needed
        description: `Test transaction on ${Date.now()} for ${amount}`, // Customize as needed
        order_id: order.id, // this comes from our backend from the razorpay.orders.create API response
        handler: function (response: RazorpayResponse) {
          // This handler is called after payment success
          console.log("Payment successful:", response);
          // You can then route to the success page with order id and other info
          //  Make sure to capture necessary details like razorpay_payment_id, razorpay_order_id, and razorpay_signature.
          router.push(`/payment/success?orderId=${order.id}`);
        },
        prefill: {
          name: "Test User", // from user details
          email: "test@example.com", // from user details
          // contact: "1234567890", // from user details
        },
        notes: {
          user: "user_id_123", // from user details
          details: JSON.stringify(cartPayload), // from cart payload
        },
        theme: {
          color: "#F37254",
        },
      };

      // Create the Razorpay checkout modal and open it
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      // Handle the case when no order is returned:
      // It might be due to an invalid cart payload, Razorpay failure, or some other issue.
      console.error("Failed to create order: ", data.error || "Unknown error");
      // Show an error to the user, e.g. using a toast notification or by updating a state variable:
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
