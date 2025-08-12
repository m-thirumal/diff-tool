This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to use it
#### Development (hot reload)
```
docker compose --profile dev up --build
```

* Uses Dockerfile.dev

* Mounts your local code (CODE_MOUNT=.) for live reload

* Runs `npm run dev`

#### Production
```
DOCKERFILE=Dockerfile CODE_MOUNT=/app START_CMD="npm start" NODE_ENV=production docker compose --profile prod up --build
```

* Uses Dockerfile (optimized build)

* No code mount → container has its own copy of the app

* Runs `npm start`

## Reset the volume (recommended for dev)

```
docker compose down -v
docker compose up --build
```

This will delete `pgdata_dev` and `pgdata_prod` volumes, wiping all data and reinitializing with the new password.