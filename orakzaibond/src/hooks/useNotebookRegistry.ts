import { useState, useEffect, useCallback } from "react";
import { JsonRpcProvider, Contract } from "ethers";
import REGISTRY_ABI from "@/abi/NotebookRegistry.json";

const REGISTRY_ADDRESS = "0xa6a1C3D97e629326ad812e97e927622A8dA711a3";
const POLYGON_RPC      = "https://polygon-bor-rpc.publicnode.com";

export interface RegistryEntry {
  address:    string;
  name:       string;
  version:    string;
  deployedAt: number;
  verified:   boolean;
  codeHash:   string;
}

export interface RegistryData {
  entries:     RegistryEntry[];
  total:       number;
  owner:       string;
  lastUpdated: number;
  isLoaded:    boolean;
}

async function safeCall<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

export function useNotebookRegistry() {
  const [data, setData]       = useState<RegistryData>({ entries: [], total: 0, owner: "", lastUpdated: 0, isLoaded: false });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const provider = new JsonRpcProvider(POLYGON_RPC, { chainId: 137, name: "polygon" });
      const registry = new Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider);

      const [total, owner, lastUpdated] = await Promise.all([
        safeCall(() => registry.totalRegistered(), BigInt(0)),
        safeCall(() => registry.owner(),           "0x0000000000000000000000000000000000000000"),
        safeCall(() => registry.lastUpdated(),     BigInt(0)),
      ]);

      const count   = Math.min(Number(total), 50);
      const entries: RegistryEntry[] = [];

      for (let i = 0; i < count; i++) {
        const info = await safeCall(() => registry.getContractAt(i), null);
        if (info) {
          entries.push({
            address:    String(info[0]),
            name:       String(info[1]),
            version:    String(info[2]),
            deployedAt: Number(info[3]),
            verified:   Boolean(info[4]),
            codeHash:   String(info[5]),
          });
        }
      }

      setData({
        entries,
        total:       Number(total),
        owner:       String(owner),
        lastUpdated: Number(lastUpdated),
        isLoaded:    true,
      });
      setError(null);
    } catch (e: any) {
      setError(e.message || "Failed to load registry");
      setData(prev => ({ ...prev, isLoaded: true }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 60_000);
    return () => clearInterval(id);
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}
