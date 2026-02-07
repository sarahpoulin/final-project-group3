# Development Environment Setup

## Prerequisites
1. Make sure you have [Docker Desktop](https://docs.docker.com/get-started/introduction/get-docker-desktop/) installed (if you haven't installed it already).

## Forking and Cloning

2. Fork the [Upstream Repository](https://github.com/NSCC-ITC-Winter2026-WEBD5020-701-MCr/final-project-group3).
3. Clone your Origin Repository (the one that was forked):
```shell
git clone https://github.com/yourgithubuser/final-project-group3.git
```

4. Add `upstream` as a remote locally
```shell
git remote add upstream https://github.com/NSCC-ITC-Winter2026-WEBD5020-701-MCr/final-project-group3
```

## Setting Up Your Dev Environment

5. Open your local repository (the one you cloned) in VS Code on your device.
6. Install everything in `package.json`:
```shell
pnpm install
```

7. Run the docker compose file:
```shell
docker compose up -d
```

8. Check if the container is running:
```shell
docker ps
```

9. Try connecting with psql inside the container (type `exit` to exit the container):
```shell
docker exec -it shoreline_postgres psql -U postgres -d shoreline_dev
```

10. Copy `.env.example`:
- Windows:
  ```powershell
  copy .env.example .env
  ```

- MacOS/Linux:
  ```shell
  cp .env.example .env
  ```

11. Generate a 32-byte random secret encoded in base64:
- Windows
  ```powershell
  $b = New-Object byte[] 32; $rng=[System.Security.Cryptography.RandomNumberGenerator]::Create(); $rng.GetBytes($b); $rng.Dispose(); [Convert]::ToBase64String($b)
  ```

- MacOS/Linux:
  ```shell
  openssl rand -base64 32
  ```

12. In `.env`, paste your newly generated secret into `NEXTAUTH_SECRET`

13. Change `AUTHORIZED_ADMIN_EMAIL` to be your own Google account email.

14. You will also need `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `CLOUDINARY_URL`, which you will receive via Teams.

15. All is well if you can successfully run `pnpm dev`.

16. Don't forget to create a branch from `main` before you start your work.

17. **Note**: Before you push your code and open a PR, always remember to do `pnpm build` to make sure there are no build errors.
