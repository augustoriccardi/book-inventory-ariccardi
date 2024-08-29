# Description

## Run Local Production Mode

1. Clone the repository.
2. Create a copy of `.env.template` and rename it to `.env` and update the environment variables.
3. Install dependencies: `npm install`
4. Start the database: `docker compose up -d` (open Docker Desktop beforehand)
5. Run Prisma migrations: `npx prisma migrate dev`
6. Execute seed: `pnpm run seed`
7. Build the project: `pnpm run build`
8. Start the project: `pnpm run start`
