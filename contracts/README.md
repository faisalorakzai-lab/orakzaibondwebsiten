# Orakzai Bond Contracts — Hardhat Workspace

This directory is the reproducibility workspace for the Polygon PoS contracts associated with the Orakzai Bond ecosystem. It is intentionally separate from the frontend application so that contract source, deployment metadata, tests, and verification records can be reviewed independently.

## Evidence boundary

The deployment manifest records contract addresses and PolygonScan evidence. PolygonScan’s **Exact Match** label means that the source submitted to PolygonScan matches the deployed bytecode. It is not an independent security audit, formal verification, regulatory approval, or guarantee of economic safety.

The exact Solidity source bundles recovered from the verified PolygonScan records are committed under `contracts/verified/`. Each bundle preserves the source files and a PolygonScan standard-json source record. The source is presented as recovered verification evidence; it is not presented as independently audited code.

## Structure

```text
contracts/
├── README.md
├── package.json
├── package-lock.json
├── hardhat.config.ts
├── tsconfig.json
├── .env.example
├── contracts/
│   ├── verified/          # Recovered PolygonScan source bundles
│   └── interfaces/        # Interfaces/ABIs used by tests and scripts
├── deployments/
│   └── polygon-mainnet.json
├── docs/
│   ├── source-recovery.md
│   └── security-status.md
├── scripts/
│   ├── deploy.ts
│   └── verify-addresses.ts
└── test/
```

## Local setup

```bash
cd contracts
npm install
npm run compile
```

Each source bundle is compiled independently because the verified deployments use different compiler versions and settings. Use the `CONTRACT_TARGET` variable:

```bash
CONTRACT_TARGET=OrakzaiBond npm run compile
CONTRACT_TARGET=OKBOND_ICO_V8 npm run compile
CONTRACT_TARGET=OrakzaiBondLottery npm run compile
CONTRACT_TARGET=OKBOND_Vault_V7 npm run compile
CONTRACT_TARGET=Legacy_OrakzaiBond npm run compile
```

The five recovered bundles compile successfully in the local validation environment. `DEPLOYER_PRIVATE_KEY` is optional for compilation and must never be committed. Use a dedicated deployer account, not a personal wallet holding significant assets.

## Polygon addresses

The canonical address manifest is `deployments/polygon-mainnet.json`. Every address must be cross-checked against PolygonScan before being used in documentation or deployment scripts.

## Reproducibility status

The source bundles and compiler profiles are present and compile successfully. Complete address-level reproducibility still requires recording constructor arguments, deployment transaction hashes, runtime bytecode hashes, and a deterministic local bytecode comparison for each deployment.

## Security status

No independent security audit is claimed by this repository. A security review should be completed before describing any contract as audited, secure, production-safe, or formally verified.
