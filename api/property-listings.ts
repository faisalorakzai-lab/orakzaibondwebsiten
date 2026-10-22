// Vercel discovers functions from the repository root, so delegate to the app implementation.
import handler from "../orakzaibond/api/property-listings";

export const config = { runtime: "edge" };
export default handler;
