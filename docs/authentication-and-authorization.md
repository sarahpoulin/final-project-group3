# Authentication and Authorization

This document describes how authentication works in this application and why editable content (projects, site settings, tags, Cloudinary) is securely protected.

## Overview

- **Auth stack:** Auth.js (NextAuth.js) with **Google OAuth** and the **Prisma adapter** (Neon PostgreSQL).
- **Access model:** Only a fixed set of admin emails can sign in. Everyone else is rejected at sign-in and cannot obtain a session. All write operations are restricted to authenticated admins.

## How Authentication Works

### 1. Who Can Sign In

Admin access is controlled by the **`AUTHORIZED_ADMIN_EMAIL`** environment variable (see `.env.example`). It supports one or more comma-separated emails:

- Only users whose email is in this list can complete sign-in.
- The list is read at startup and cached in memory in `src/lib/auth.ts` (function `getAuthorizedAdminEmails()`).
- Emails are compared in a case-insensitive way.

If `AUTHORIZED_ADMIN_EMAIL` is missing or empty, **no one** can sign in (the sign-in callback returns `false` for every user).

### 2. Sign-In Flow

1. User goes to `/admin/login` and chooses “Sign in with Google.”
2. NextAuth redirects to Google OAuth. After the user approves, Google redirects back with an authorization code.
3. NextAuth exchanges the code for tokens and, via the **Prisma adapter**, creates or updates:
   - A **User** row (if new) and an **Account** row linking the user to Google.
   - A **Session** row and an HTTP-only session cookie.
4. The **signIn** callback runs:
   - If `AUTHORIZED_ADMIN_EMAIL` is empty → sign-in is **rejected**.
   - If the user’s email is **not** in the allowed set → sign-in is **rejected**.
   - Otherwise sign-in succeeds.
5. On successful sign-in, the **events.signIn** handler sets `User.isAdmin = true` for that email so the database stays in sync with the whitelist.

So: only whitelisted admins get a session; everyone else is blocked before a session is created.

### 3. Session and Admin Flag

- The **session** callback adds to the session object:
  - `user.id` (database user id)
  - `user.isAdmin` (from `User.isAdmin` in the database).
- Admin status is always read from the **database**, not only from the env list, so revoking access (e.g. by removing the user from the env or setting `isAdmin = false`) is respected on the next request.

### 4. Where Auth Is Used

- **Routes:** `/api/auth/[...nextauth]` — GET/POST for sign-in, sign-out, session, CSRF, etc.
- **Config:** `src/lib/auth.ts` — NextAuth config, adapter, callbacks, and exports (`auth`, `signIn`, `signOut`, `handlers`).
- **API guards:** `src/lib/auth-guards.ts` — `requireAdmin()` and `verifyAdmin()` used by write APIs (see below).

---

## Why Editable Content Is Securely Protected

Editable content is protected in two ways: **who can sign in** (above) and **who can call write APIs** (below). Security does **not** rely on hiding UI; it relies on server-side checks on every mutating request.

### 1. All Mutating APIs Require Admin

Every API that **creates, updates, or deletes** data calls `requireAdmin()` or `verifyAdmin()` before doing any work. These guards:

- Use `auth()` to get the current session (from the session cookie).
- If there is no session → return **401 Unauthorized**.
- If there is a session but the user’s `User.isAdmin` is not true → return **403 Forbidden**.
- Only if the user is an authenticated admin do they return success so the handler proceeds.

So even if someone discovers API URLs or bypasses the admin UI, they cannot create/update/delete anything without a valid admin session.

### 2. Protected API Endpoints

| Area | Endpoint(s) | Guard | Purpose |
|------|-------------|--------|---------|
| Projects | `POST /api/projects` | `requireAdmin` | Create project |
| Projects | `PATCH /api/projects/[id]`, `DELETE /api/projects/[id]` | `verifyAdmin` | Update/delete project |
| Projects | `PATCH /api/projects/order` | `requireAdmin` | Reorder projects |
| Site settings | `PATCH /api/site-settings` | `requireAdmin` | Update about-page content (headings, body, etc.) |
| Tags | `POST /api/tags`, `PATCH /api/tags/[id]`, `DELETE /api/tags/[id]` | `requireAdmin` | Create/update/delete tags |
| Cloudinary | `GET /api/cloudinary-config`, `POST /api/cloudinary-delete`, `POST /api/cloudinary-cleanup` | `requireAdmin` | Upload config, delete/cleanup images |

Read-only endpoints that are **intentionally public** (no admin check):

- `GET /api/site-settings` — so the about page can display content for everyone.
- `GET /api/projects` (and project by id for public display) — public portfolio.

So: **only admins can change** projects, site settings, tags, and Cloudinary assets; the rest of the API is read-only for unauthenticated or non-admin users.

### 3. Admin Status From the Database

`requireAdmin` / `verifyAdmin` in `src/lib/auth-guards.ts` use `getSessionAndAdminUser()`, which:

1. Gets the session via `auth()`.
2. Loads `User.isAdmin` from the database by `user.id` (or email).

So admin status is **authoritative in the database**. Changing `AUTHORIZED_ADMIN_EMAIL` or flipping `User.isAdmin` takes effect on the next request; no restart required for revocation.

### 4. UI vs Security

- The admin dashboard (`/admin`) and edit controls (e.g. on About, Projects) only show when the user is signed in and treated as admin by the app.
- **Hiding the UI is not the security boundary.** The security boundary is: **no mutating API succeeds without passing `requireAdmin` / `verifyAdmin`.** So even if the UI were bypassed or an attacker called the APIs directly, they would get 401/403 unless they had a valid admin session.

### Summary

- Only whitelisted emails can sign in (Google OAuth + `AUTHORIZED_ADMIN_EMAIL`).
- Session and admin flag are stored and validated via Auth.js + Prisma (User, Session, Account).
- Every create/update/delete API uses `requireAdmin()` or `verifyAdmin()` and returns 401/403 when the user is not an authenticated admin.
- Admin status is read from the database on each request, so editable content remains securely protected and access can be revoked without code changes.

---

## VerificationToken Table (Why It Exists and Why It’s Empty)

There is a **`VerificationToken`** table in Neon because the **Auth.js Prisma adapter** expects it: the [adapter’s schema](https://authjs.dev/reference/adapter/prisma#schema) includes `VerificationToken` for providers that use **verification tokens** (e.g. magic-link email, or “sign in with email” flows that send a one-time link).

This app uses **only Google OAuth**. With Google:

- There is no “verify this email” step in the app.
- Google handles identity; Auth.js never creates rows in `VerificationToken`.

So:

- **Why the table exists:** Required by the Prisma adapter schema so Auth.js can support adapters that do use verification tokens. If removed, the adapter could complain or break if a provider is added that uses it.
- **Why it’s empty:** No flow that writes verification tokens (no magic link, no email verification provider) ever uses it. It’s normal and safe for this table to stay empty in the setup.

Leave the table as-is; it doesn’t affect security or behavior for Google-only auth.
