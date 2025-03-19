# Razorpay

## pre-reqs

### create a razorpay account

- do all the KYC stuff first
- create business policy pages

### create API test keys

- generate `Test Key ID` & `Test Key Secret`

### setup webhooks

- setup [webhooks](https://dashboard.razorpay.com/app/website-app-settings/webhooks) in the razorpay dashboard (dashboard > account settings > Website and app settings > webhooks)

- you have to create a webhook secret during this process, use the same in the codebase later.

- use a dummy ngrok url to setup webhook for local testing

```bash
ngrok http 3000
```

- use this ngrok generated url to set in razorpay webhooks dashboard to `https://your-ngrok-url/api/razorpay/webhooks`

## Webhook Event payload processing

- in the route handler we capture the payload from the webhook event, verify the signature using our webhook secret.

- from the payload we use `event` to get our data & process accordingly

- for now we handle these events for "paid", "failed" , "refunded" from razorpay

```bash
PAYMENT_CAPTURED: "payment.captured",
PAYMENT_FAILED: "payment.failed",
REFUND_PROCESSED: "refund.processed",
```

### "payment.captured"

- update Orders table
- update Products table

### "payment.captured"

- update Orders table
- update Products table

### "payment.failed"

- update Orders table

### "payment.failed"

- update Orders table
- update Products table ("archived")

## create order using RazorPay API

- get the cart payload, validate it from the database and create a razorpay `order` using `razorpay.orders.create(options)`
- save it in the DB
- pass this `order` details like razorpay order-id to the client (UI) razorpay SDK

## client UI razorpay SDK

- create an `options` object

```bash
 const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
    order_id: "", // razorpay order id
    amount: "", // razorpay amount
    currency: "", // razorpay currency

    // branding details
    name: APP_NAME,
    // logo: "/logo.png",
    theme: {
        color: "#F37254",
    },

    description: "", // description of the cart, use id, title, price

    // prefill details
    prefill: {
        name: "", // user name
        email: "", // user email
        // contact: "", // user phone
    },

    // notes, for razorpay records
    notes: {
        orderId: "", // our DB order ID
        details: JSON.stringify(cartPayload),
    },

    // payment success handler
    handler: function (response: RazorpayResponse) {
        router.push(`/payment/success?orderId=${our_db_order_id}`);
    },
};
```

- after gathering `options` pass it to

```bash
const rzp = new window.Razorpay(options);
rzp.open();
```
