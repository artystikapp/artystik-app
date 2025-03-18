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
