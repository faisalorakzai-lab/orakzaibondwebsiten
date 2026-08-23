import { ethers } from "hardhat";

async function main() {
  const network = (await ethers.provider.getNetwork()).chainId;
  const isMainnet = network === 137n;
  if (isMainnet && process.env.CONFIRM_MAINNET_DEPLOYMENT !== "YES") {
    throw new Error(
      "Mainnet deployment blocked. Set CONFIRM_MAINNET_DEPLOYMENT=YES only after independent review.",
    );
  }

  console.log(`Deployment script loaded for chainId=${network}.`);
  console.log(
    "No contract is deployed by this generic script: recovered PolygonScan sources must be mapped to constructor arguments and deployment records first.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
