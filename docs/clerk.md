# Clerk Usage in pur App documentation

We are using ClerkJS for authentication in our Next 15 app

## Clerk.js Authentication Setup

Users can log in via Google.
Clerk authentication pages set up using the App Router (/sign-in, /sign-up).
Middleware added for protected routes. (middleware.ts)

```ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/",
  "/api/clerk-webhooks/user-events",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});
```

## Webhooks for User Events

- Handling user.created, user.updated, user.deleted events.
- API Route: app/api/clerk-webhooks/user-events/route.ts

## Local Testing

```bash
ngrok http 3000
```

use this ngrok generated url to set in clerk dashboard to `https://your-ngrok-url/api/clerk-webhooks/user-events`

## Clerk fields received in clerk payload

### Always guaranteed:

- id (userId) - This is always present and unique
- emailAddresses array - But might be empty if user signed up with OAuth
- createdAt timestamp

### Not guaranteed:

- firstName - Optional, might be null/empty
- lastName - Optional, might be null/empty
- username - Optional, might be null/empty
- imageUrl - Optional, depends on sign-up method
