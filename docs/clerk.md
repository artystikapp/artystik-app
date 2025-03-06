# Clerk documentation

## Clerk fields received

### Always guaranteed:

id (userId) - This is always present and unique
emailAddresses array - But might be empty if user signed up with OAuth
createdAt timestamp

### Not guaranteed:

firstName - Optional, might be null/empty
lastName - Optional, might be null/empty
username - Optional, might be null/empty
imageUrl - Optional, depends on sign-up method
