# Database

## Neon DB

- `main` branch for PROD
- `develop` branch for DEV

## prisma setup

install prisma & prisma client

```bash
npm install prisma @prisma/client
```

initialize prisma in your codebase

```bash
npx prisma init
```

- creates a schema.prisma file
- updates .env file with DATABASE_URL

## Development Workflow (migrate dev):

```bash
npx prisma migrate dev
```

- Generates new migration files based on schema changes.
- Applies migrations interactively to your dev database.
- Regenerates Prisma Client to keep it in sync with the new schema.

## Production Workflow (migrate deploy):

```bash
npx prisma migrate deploy
```

- Applies existing migration files (no new migrations are created).
- Runs non-interactively (suitable for CI/CD pipelines or production environments).
- Does not update the Prisma Client, assuming the client is already built/deployed.

## AUTH flow

- we get auth data from clerk webhook payload
- we are handling in the `User` table `createdAt`, `updatedAt` at the DB level. so expect a bit latency between clerk webhook data & DB data for those fields.

## CI/CD

- prisma generate makes sure the prisma client in `node_modules` is up-to-date with the schema changes already in the code.
- "build:prod" to be used only on production environment.

```bash
  "postinstall": "npx prisma generate",
  "build:prod": "npx prisma migrate deploy && next build",
```
