# Managing Your Dev Environment

### Prisma

- Open Prisma Studio (database GUI)
  ```shell
  pnpm prisma studio
  ```

- Reset database
  ```shell
  pnpm prisma migrate reset
  ```

- Push schema changes without migration
  ```shell
  pnpm prisma db push
  ````

- [Prisma Query Docs](https://www.prisma.io/nextjs)

### Docker-PostgreSQL

- Start PostgreSQL
  ```shell
  docker-compose up -d
  ```

- Stop PostgreSQL
  ```shell
  docker-compose down
  ```

- View logs
  ```shell
  docker-compose logs -f postgres
  ```

### pnpm Commands

- Run dev server
  ```shell
  pnpm dev
  ```

- Build for production
  ```shell
  pnpm build
  ```

- Start production server
  ```shell
  pnpm start
  ```

- Lint code
  ```shell
  pnpm lint
  ```
