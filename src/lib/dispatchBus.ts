/**
 * dispatchBus — Pinned Dispatch (Chairman's Broadcast) backed by Supabase posts.
 *
 * A "dispatch" is a Supabase post written by the Chairman wallet whose content
 * begins with PREFIX. The /system news ticker fetches recent dispatches and
 * prepends them with red/gold styling, so the community sees them immediately.
 *
 * Why piggyback on `posts`: the existing schema already supports it (RLS
 * policies are already configured for posts). No migration required.
 */

import { supabase } from "./supabase";
import { ADMIN_WALLET } from "./adminAuth";

export const DISPATCH_PREFIX = "📢 [DISPATCH] ";

export interface Dispatch {
  id: string;
  message: string;
  created_at: string;
}

/**
 * Broadcast a new pinned dispatch. Caller must be the Chairman wallet
 * (verified by AdminGate). This writes a row to `posts`.
 */
export async function broadcastDispatch(message: string): Promise<void> {
  const trimmed = message.trim();
  if (!trimmed) throw new Error("Dispatch message cannot be empty.");
  if (trimmed.length > 280) throw new Error("Dispatch must be 280 characters or fewer.");

  const { error } = await supabase.from("posts").insert({
    address: ADMIN_WALLET.toLowerCase(),
    content: `${DISPATCH_PREFIX}${trimmed}`,
    image_url: null,
  });
  if (error) throw new Error(error.message);
}

/**
 * Fetch the most recent N dispatches. Public read — anyone can see them.
 */
export async function fetchRecentDispatches(limit = 8): Promise<Dispatch[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, content, created_at")
    .eq("address", ADMIN_WALLET.toLowerCase())
    .ilike("content", `${DISPATCH_PREFIX}%`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map((row: { id: string; content: string; created_at: string }) => ({
    id: row.id,
    message: row.content.startsWith(DISPATCH_PREFIX)
      ? row.content.slice(DISPATCH_PREFIX.length)
      : row.content,
    created_at: row.created_at,
  }));
}

/**
 * Unpin (delete) a previously broadcast dispatch. Chairman-only.
 */
export async function unpinDispatch(id: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
