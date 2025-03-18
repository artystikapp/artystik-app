/**
 * Razorpay Event Types
 */
export const RAZORPAY_EVENT_TYPES = {
  PAYMENT_CAPTURED: "payment.captured",
  PAYMENT_FAILED: "payment.failed",
  REFUND_PROCESSED: "refund.processed",
  // Add additional Razorpay event types if needed (e.g., "payment.authorized")
};

/**
 * Order Status Mapping
 * These statuses represent your internal order lifecycle.
 * They are mapped to the Razorpay event types where applicable.
 */
export const ORDER_STATUS = {
  PENDING: "pending", // Initial state: order created but payment not confirmed.
  PAID: "paid", // Payment captured (mapped from RAZORPAY_EVENT_TYPES.PAYMENT_CAPTURED).
  SHIPPED: "shipped", // Order has been dispatched.
  DELIVERED: "delivered", // Order has been delivered to the customer.
  FAILED: "failed", // Payment failed (mapped from RAZORPAY_EVENT_TYPES.PAYMENT_FAILED).
  REFUNDED: "refunded", // Payment refunded (mapped from RAZORPAY_EVENT_TYPES.REFUND_PROCESSED).
};

/**
 * Product Status Mapping
 * Updated to include an archived state for products that are no longer active.
 */
export const PRODUCT_STATUS = {
  AVAILABLE: "available", // Product is available for sale.
  SOLD: "sold", // Product has been sold.
  ARCHIVED: "archived", // Product is discontinued or no longer available.
};

export const CURRENCY = {
  INR: "INR",
};

// branding
export const APP_NAME = "Artystik App";
