import React from "react";
import { Contract, BrowserProvider, formatUnits } from "ethers";

const CONTRACT_ADDRESS = "0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F";
const ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)"
];

export function useTokenData(provider: BrowserProvider | null) {
  const [data, setData] = React.useState<{ name: string; symbol: string; totalSupply: string } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      if (!provider) return;
      setLoading(true);
      setError(null);
      try {
        const contract = new Contract(CONTRACT_ADDRESS, ABI, provider);
        const [name, symbol, supply] = await Promise.all([
          contract.name(),
          contract.symbol(),
          contract.totalSupply()
        ]);
        setData({
          name,
          symbol,
          totalSupply: formatUnits(supply, 18) // assuming 18 decimals, can adjust if needed
        });
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch token data. Please ensure you are connected to the correct network.");
      } finally {
        setLoading(false);
      }
    }

    if (provider) {
      fetchData();
    }
  }, [provider]);

  return { data, loading, error, contractAddress: CONTRACT_ADDRESS };
}
