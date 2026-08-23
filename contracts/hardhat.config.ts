import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import type { HardhatUserConfig } from "hardhat/config";

const accounts = process.env.DEPLOYER_PRIVATE_KEY
  ? [process.env.DEPLOYER_PRIVATE_KEY]
  : [];
const target = process.env.CONTRACT_TARGET || "OrakzaiBond";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      metadata: { bytecodeHash: "ipfs" },
    },
  },
  paths: {
    // Each PolygonScan standard-json bundle is compiled independently.
    // This preserves the original import paths and avoids mixing compiler profiles.
    sources: `./contracts/verified/${target}`,
    tests: "./test",
    cache: `./cache/${target}`,
    artifacts: `./artifacts/${target}`,
  },
  networks: {
    hardhat: { chainId: 31337 },
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-bor-rpc.publicnode.com",
      chainId: 137,
      accounts,
    },
    amoy: {
      url: process.env.AMOY_RPC_URL || "https://rpc-amoy.polygon.technology",
      chainId: 80002,
      accounts,
    },
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
    },
  },
};

export default config;
