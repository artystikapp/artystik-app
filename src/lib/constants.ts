/**
 * Database mappers
 */

export const RAZORPAY_EVENT_TYPES = {
  PAYMENT_CAPTURED: "payment.captured",
  PAYMENT_FAILED: "payment.failed",
  REFUND_PROCESSED: "refund.processed",
  // add more event types as needed
};

export const ORDER_STATUS = {
  PENDING: "pending", // initial state
  PAID: "paid", // RAZORPAY_EVENT_TYPES.PAYMENT_CAPTURED
  FAILED: "failed", // RAZORPAY_EVENT_TYPES.PAYMENT_FAILED
  REFUNDED: "refunded", // RAZORPAY_EVENT_TYPES.REFUND_PROCESSED
};
