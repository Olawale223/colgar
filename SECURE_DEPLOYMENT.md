# Colgar public site and Admin Studio

The public website and Admin Studio share this Next.js codebase but deploy as separate Cloudflare Workers. MongoDB Atlas stores content, staff roles, newsletter records, finance history, audit events, and orders. A Durable Object owns the MongoDB client and provides strongly consistent rate limits.

## 1. Prepare MongoDB Atlas

1. Create a MongoDB Atlas database and a dedicated database user with read/write access only to the Colgar database. Use TLS and a strong, unique password.
2. Restrict Atlas network access to the static Cloudflare Worker egress IP range available for your Cloudflare plan. Do not use `0.0.0.0/0` as a production allowlist. If your plan does not provide suitable static egress, configure an approved private-network path before deploying.
3. Copy `.env.example` to `.env.local` and set `MONGODB_URI`, `MONGODB_DB`, and a random `RATE_LIMIT_SECRET`.
4. Initialize indexes and seed starter records:

   ```powershell
   npm run db:init
   npm run seed:content
   ```

   The seed uses `$setOnInsert`, so edits and records already in MongoDB are preserved.
5. Add staff records explicitly. Only provision identities already allowed by Cloudflare Access:

   ```powershell
   npm run staff:provision -- staff@example.org admin
   npm run staff:provision -- editor@example.org content_editor
   npm run staff:provision -- finance@example.org finance_manager
   ```

   Supported roles are `admin`, `content_editor`, and `finance_manager`. Set `enabled` to `false` in the staff record to revoke application access.

## 2. Configure Google sign-in through Cloudflare Access

1. In Google Cloud Console, create an OAuth client with application type **Web application**. Set the authorized JavaScript origin to `https://<team-name>.cloudflareaccess.com` and the authorized redirect URI to `https://<team-name>.cloudflareaccess.com/cdn-cgi/access/callback`.
2. In Cloudflare Zero Trust, go to **Integrations > Identity providers**, add **Google**, and enter the OAuth client ID and client secret. Keep the client secret in Cloudflare's identity-provider settings; never put it in this repository.
3. Create a Cloudflare Access self-hosted application for the private Admin Studio hostname (for example `admin.colgar.org`) and enable Google as its login method.
4. Add an allow policy limited to approved staff identities and require MFA in the Access policy. Apply the MFA requirement to the entire Admin Studio application; finance authorization is role-checked again by the server.
5. Copy the Access team domain, including the `https://` scheme, and the application audience tag into `CLOUDFLARE_ACCESS_TEAM_DOMAIN` and `CLOUDFLARE_ACCESS_AUD` in `wrangler.jsonc` and `.env.local`. The API verifies the signed Access JWT issuer and audience and then looks up the enabled staff role in MongoDB. The Google account's email must match the staff record.
6. Keep MongoDB, Paystack, Resend, rate-limit, and Google OAuth client secrets out of `vars`, source code, and client-visible `NEXT_PUBLIC_` variables. Store Worker secrets with Wrangler; store the Google OAuth client secret in Cloudflare Zero Trust's identity-provider settings.

## 3. Deploy the two Workers

Set the public production URL in the build environment (`NEXT_PUBLIC_SITE_URL=https://www.colgar.org`) and configure `.env.local` for the Cloudflare build. Install dependencies, generate Worker types, then deploy:

```powershell
npm install
npm run cf:typegen
npm run cf:deploy:public
npm run cf:deploy:admin
```

`wrangler.jsonc` sets `APP_ROLE=public` on the public Worker and `APP_ROLE=admin` on the `admin` environment. Middleware returns 404 for the other deployment's routes. Both environments use their own Durable Object namespace and deployment name while sharing the Atlas database.

Configure these Cloudflare variables on both Workers:

- `MONGODB_DB=colgar`
- `CLOUDFLARE_ACCESS_TEAM_DOMAIN`
- `CLOUDFLARE_ACCESS_AUD`
- `NEXT_PUBLIC_SITE_URL=https://www.colgar.org`

Configure secrets using Wrangler (repeat the commands with `--env admin` for the Admin Worker):

```powershell
npx wrangler secret put MONGODB_URI
npx wrangler secret put RATE_LIMIT_SECRET
npx wrangler secret put PAYSTACK_SECRET_KEY
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put NEWSLETTER_FROM
```

`PAYSTACK_SECRET_KEY` is only needed on the public Worker. `RESEND_API_KEY` and `NEWSLETTER_FROM` are needed on both Workers. Use separate random rate-limit secrets for public and admin deployments. For local OpenNext Worker preview, copy `.dev.vars.example` to `.dev.vars` and fill in local/test values.

In Paystack, set the webhook URL to `https://www.colgar.org/api/public/payments/webhook`. Set the sender in Resend to a verified domain. Live payment and email flows require real provider secrets and callback/domain configuration.

## 4. Local development and verification

For regular Next.js development, set `MONGODB_URI` in `.env.local`, then run:

```powershell
npm run dev
npm run typecheck
npm run build
```

To test the actual Workers runtime and local Durable Object:

```powershell
npm run cf:preview
```

The adapter's Worker build/deploy commands are used instead of `next start` for Cloudflare. Do not run `npm run db:init` or seed scripts against production unless intentionally provisioning that database.

## Security and operations

- Staff authentication uses Cloudflare Access JWTs. Application authorization uses enabled MongoDB staff records and role checks in every admin API. Passwords and staff sessions are not stored by the application.
- Require MFA in the Cloudflare Access policy covering the complete Admin Studio host. Protect the admin hostname and keep the Worker API role separation enabled.
- Rate limits are keyed by an HMAC of the client IP and stored in Durable Object SQLite; raw IP addresses are not persisted.
- Public content reads only published stories and visible products. Checkout prices are re-read from MongoDB on the server; order totals are not trusted from the browser. Payment confirmation verifies Paystack signature and order amount, currency, email, and reference before marking an order paid.
- Finance endpoints require an enabled `admin` or `finance_manager` staff record. Admin write operations are recorded in the MongoDB audit collection. MongoDB Atlas credentials must be least-privilege and rotated using Cloudflare secrets.
- Newsletter signup uses confirmation and unsubscribe tokens. Sending remains direct and capped at 500 confirmed subscribers per request; larger lists should use a queue.
- No live Atlas, Cloudflare Access, Paystack, or Resend credentials were present in this workspace. Run a deployed end-to-end test after provider configuration.
d