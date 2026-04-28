# siwe-verify — Wallet-gated Supabase auth bridge

This Edge Function is the bridge between the SIWE wallet signature produced by
`src/lib/adminAuth.ts` and Supabase Row Level Security. It accepts a signed
SIWE message, recovers the signer, confirms it appears in the `admin_wallets`
table, and returns a Supabase JWT carrying a `wallet_address` claim.

The RLS policies in `supabase_migrations/004_admin_wallet_rls.sql` read that
claim through `current_admin_wallet()` and only allow writes when the claim
matches a row in `admin_wallets`.

## Activation checklist

1. **Apply the migration**
   In the Supabase SQL editor, run
   `supabase_migrations/004_admin_wallet_rls.sql`.
   This locks all writes on `profiles`, `posts`, `likes`, `comments`, and
   `follows` behind a wallet JWT claim. After this step, anonymous writes are
   denied — the admin panel cannot write again until step 3 is complete.

2. **Deploy the function**
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   supabase functions deploy siwe-verify --no-verify-jwt
   ```
   `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_JWT_SECRET` are
   injected automatically; you do not need to set them manually.

3. **Wire the frontend**
   In the admin panel, after `signInWithPolygon()` returns the SIWE proof,
   POST `{ message, signature }` to
   `${SUPABASE_URL}/functions/v1/siwe-verify`, then call
   ```ts
   await supabase.auth.setSession({
     access_token: data.access_token,
     refresh_token: data.access_token, // we are not issuing refresh tokens
   });
   ```
   All subsequent Supabase calls from the admin panel will then carry the
   wallet claim and pass RLS.

## Adding more admin wallets

```sql
INSERT INTO admin_wallets (address, label) VALUES
  ('0x<another lowercase address>', 'Co-founder');
```

## Security notes

- The function only trusts a SIWE message that contains the recovered signer's
  own address and `Network: Polygon Mainnet`, matching the message produced by
  `src/lib/adminAuth.ts`.
- Tokens expire in 1 hour, mirroring the AdminGate session TTL.
- The `admin_wallets` table has read-only RLS — only the service-role key
  (used by this function) can mutate it.
