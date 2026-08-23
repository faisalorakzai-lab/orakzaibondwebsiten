# Verified Source Recovery Checklist

For each Polygon deployment, recover the exact verified source from PolygonScan and preserve the following metadata:

1. Contract name and Solidity source path.
2. Compiler version and commit.
3. Optimizer enabled/disabled and run count.
4. EVM version.
5. Constructor arguments in ABI-encoded form.
6. Deployment transaction hash and block number.
7. Runtime bytecode hash from the deployed address.
8. A clean Hardhat compilation record.
9. A comparison showing that the locally compiled runtime bytecode matches the deployed runtime bytecode.
10. Any libraries and linked-library addresses.

Do not rename, simplify, or rewrite verified source while claiming exact reproducibility. If the source cannot be recovered, retain the address and ABI as evidence but mark source reproducibility as pending.
