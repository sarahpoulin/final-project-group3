# Shoreline Woodworks Website

## Figma Prototype

- This is the [Figma Prototype](https://www.figma.com/make/ztIH2APn6V2Js8JUqiKMhY/Carpentry-Business-Website?t=nti6zxyZi9QUghD4-20&fullscreen=1).
- You can generally base the front end work off of. It might change as we go.
- If you want to view the mobile prototype, open developer tools and toggle on the "Toggle Device Toolbar" (`shift` + `ctrl` + `m`).


## [Development Environment Setup](./docs/setup-dev-environment.md#development-environment-setup)

## [Managing Your Development Environment](./docs/managing-dev-environment.md#managing-your-dev-environment)
* [Prisma](./docs/managing-dev-environment.md#prisma)  
* [Docker-PostgreSQL](./docs/managing-dev-environment.md#docker-postgresql)  
* [pnpm Commands](./docs/managing-dev-environment.md#pnpm-commands)  

## [Working with Forks in GitHub](./docs/git-workflow.md#github-workflow-with-forks)

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

### Docker/PostgreSQL

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

### Cloudinary

[Cloudinary Docs](https://cloudinary.com/documentation/transformation_reference)

Cloudinary (Free Tier Limit) Details:
- Maximum image file size: 10 MB
- Maximum video file size: 100 MB
- Maximum online image manipulation size: 100 MB
- Maximum raw file size: 10 MB
- Maximum image megapixels: 25 MP
- Maximum total number of megapixels in all frames: 50 MP