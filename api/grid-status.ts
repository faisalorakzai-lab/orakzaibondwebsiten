// Vercel Serverless Function — /api/grid-status
// ----------------------------------------------------------------------------
// Returns the current "Sovereign Grid" telemetry used by the Marcus briefing.
// Today this is a deterministic synthetic feed that drifts with the time of
// day so it always feels alive without exposing any sensitive backend state.
//
// Replace `synthesizeConnections()` with a real database query (Supabase,
// Polygon RPC, or analytics) when the underlying grid is wired up.
// ----------------------------------------------------------------------------

function synthesizeConnections(): number {
  const now = Date.now();
  // Slow-drift baseline (changes every 5 minutes) + smooth diurnal curve.
  const seed = Math.floor(now / (1000 * 60 * 5));
  const baseline = 1280 + ((seed * 137) % 420);          // 1280 – 1700
  const hour = new Date(now).getUTCHours();
  // Peak ~ 14:00 UTC, trough ~ 02:00 UTC
  const diurnal = Math.round(180 * Math.cos(((hour - 14) / 24) * 2 * Math.PI));
  return Math.max(800, baseline + diurnal);
}

export default async function handler(_req: any, res: any) {
  const activeConnections = synthesizeConnections();
  res.setHeader("Cache-Control", "public, max-age=15, s-maxage=30");
  return res.status(200).json({
    activeConnections,
    region: "global",
    network: "Sovereign Grid",
    timestamp: new Date().toISOString(),
  });
}
