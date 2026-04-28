// Supabase Edge Function: siwe-verify
// -----------------------------------------------------------------------------
// Verifies a SIWE (Sign-In With Polygon) message signed by the admin wallet,
// then mints a Supabase JWT containing a `wallet_address` claim. The frontend
// uses the returned token as its Supabase session token; the RLS policies in
// supabase_migrations/004_admin_wallet_rls.sql then check that claim.
//
// DEPLOY
//   supabase functions deploy siwe-verify --no-verify-jwt
//
// REQUIRED SECRETS  (supabase secrets set ...)
//   SUPABASE_URL                 (auto-injected by Supabase)
//   SUPABASE_SERVICE_ROLE_KEY    (auto-injected by Supabase)
//   SUPABASE_JWT_SECRET          (auto-injected by Supabase)
//
// REQUEST  (POST application/json)
//   { "message": "<full SIWE message>", "signature": "0x..." }
//
// RESPONSE
//   200 { "access_token": "<jwt>", "wallet_address": "0x..." }
//   401 { "error": "<reason>" }
// -----------------------------------------------------------------------------

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { verifyMessage } from "https://esm.sh/ethers@6.13.4";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") {
    return json({ error: "method not allowed" }, 405);
  }

  let body: { message?: string; signature?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }
  const { message, signature } = body;
  if (!message || !signature) {
    return json({ error: "message and signature required" }, 400);
  }

  // 1. Recover signer from signature
  let signer: string;
  try {
    signer = verifyMessage(message, signature).toLowerCase();
  } catch (e) {
    return json({ error: "signature verification failed" }, 401);
  }

  // 2. Confirm signer is an authorised admin wallet
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data: row, error } = await supabase
    .from("admin_wallets")
    .select("address")
    .eq("address", signer)
    .maybeSingle();
  if (error)        return json({ error: "db lookup failed" }, 500);
  if (!row)         return json({ error: "wallet not authorised" }, 401);

  // 3. Light SIWE sanity checks (block trivial replays)
  if (!message.includes(signer)) {
    return json({ error: "address mismatch in message" }, 401);
  }
  if (!/Network:\s*Polygon Mainnet/i.test(message)) {
    return json({ error: "wrong network" }, 401);
  }

  // 4. Mint a Supabase-compatible JWT with the wallet_address claim
  const jwtSecret = Deno.env.get("SUPABASE_JWT_SECRET")!;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(jwtSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  const token = await create(
    { alg: "HS256", typ: "JWT" },
    {
      sub: signer,
      role: "authenticated",
      aud: "authenticated",
      wallet_address: signer,
      iat: getNumericDate(0),
      exp: getNumericDate(60 * 60), // 1h, mirrors AdminGate session TTL
    },
    key,
  );

  return json({ access_token: token, wallet_address: signer }, 200);
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "content-type": "application/json" },
  });
}
