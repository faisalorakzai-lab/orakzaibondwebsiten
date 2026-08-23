import { readFile } from "node:fs/promises";
import { JsonRpcProvider, getCode } from "ethers";

const manifest = JSON.parse(
  await readFile(new URL("../deployments/polygon-mainnet.json", import.meta.url), "utf8"),
);
const provider = new JsonRpcProvider(
  process.env.POLYGON_RPC_URL || "https://polygon-bor-rpc.publicnode.com",
);

for (const [name, record] of Object.entries(manifest.contracts) as [string, any][]) {
  const code = await provider.getCode(record.address);
  const deployed = code !== "0x";
  console.log(`${name}\t${record.address}\tdeployed=${deployed}\tbytes=${deployed ? (code.length - 2) / 2 : 0}`);
}
