import { useState, useCallback, useEffect } from "react";
import { BrowserProvider } from "ethers";

const POLYGON_CHAIN_ID = 137;
const POLYGON_HEX      = "0x89";
const OKBOND_CONTRACT  = "0xc89729DA02a8c2E282EC3070A9a680E01bE2E22F";
const POLYGON_RPC      = "https://polygon-bor-rpc.publicnode.com";

// ERC-20 balanceOf(address) selector + 32-byte padded address
function buildBalanceOfCall(addr: string): string {
  const hex = addr.toLowerCase().replace("0x", "").padStart(64, "0");
  return "0x70a08231" + hex;
}

// Parse uint256 hex → decimal string with 18-decimal formatting
function parseOkbond(hexResult: string): string {
  if (!hexResult || hexResult === "0x") return "0";
  try {
    const raw = BigInt(hexResult);
    if (raw === 0n) return "0";
    const decimals = 18n;
    const divisor  = 10n ** decimals;
    const whole    = raw / divisor;
    const frac     = raw % divisor;
    // Show up to 2 decimal places
    const fracStr  = frac.toString().padStart(18, "0").slice(0, 2);
    const formatted = Number(whole).toLocaleString("en-US");
    return fracStr === "00" ? formatted : `${formatted}.${fracStr}`;
  } catch {
    return "0";
  }
}

async function fetchOkbondBalance(address: string): Promise<string> {
  const payload = {
    jsonrpc: "2.0",
    method: "eth_call",
    params: [{ to: OKBOND_CONTRACT, data: buildBalanceOfCall(address) }, "latest"],
    id: 1,
  };
  const r = await fetch(POLYGON_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await r.json();
  if (data?.result) return parseOkbond(data.result);
  return "0";
}

export function useWallet() {
  const [address,  setAddress]  = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [chainId,  setChainId]  = useState<number | null>(null);
  const [error,    setError]    = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [okbondBalance, setOkbondBalance] = useState<string | null>(null);

  const isPolygon = chainId === POLYGON_CHAIN_ID;

  async function detectChain(bp: BrowserProvider) {
    try {
      const net = await bp.getNetwork();
      setChainId(Number(net.chainId));
    } catch { /* ignore */ }
  }

  const refreshOkbondBalance = useCallback(async (addr: string) => {
    try {
      const bal = await fetchOkbondBalance(addr);
      setOkbondBalance(bal);
    } catch {
      setOkbondBalance(null);
    }
  }, []);

  const switchToPolygon = useCallback(async () => {
    if (!window.ethereum) return;
    setError(null);
    try {
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: POLYGON_HEX }] });
    } catch (switchErr: unknown) {
      const code = switchErr && typeof switchErr === "object" && "code" in switchErr
        ? (switchErr as { code: number }).code : null;
      if (code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: POLYGON_HEX,
              chainName: "Polygon Mainnet",
              nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
              rpcUrls: ["https://polygon-bor-rpc.publicnode.com", "https://rpc.ankr.com/polygon"],
              blockExplorerUrls: ["https://polygonscan.com/"],
            }],
          });
        } catch (addErr) {
          if (addErr instanceof Error) setError(addErr.message);
        }
      } else if (switchErr instanceof Error) {
        setError(switchErr.message);
      }
    }
  }, []);

  const handleAccountsChanged = useCallback((rawAccounts: unknown) => {
    const accounts = rawAccounts as string[];
    if (accounts.length > 0) {
      setAddress(accounts[0]);
      refreshOkbondBalance(accounts[0]);
      if (window.ethereum) {
        const bp = new BrowserProvider(window.ethereum);
        setProvider(bp);
        detectChain(bp);
      }
    } else {
      setAddress(null);
      setProvider(null);
      setChainId(null);
      setOkbondBalance(null);
    }
  }, [refreshOkbondBalance]);

  const handleChainChanged = useCallback((chainHex: unknown) => {
    const newId = parseInt(chainHex as string, 16);
    setChainId(isNaN(newId) ? null : newId);
    if (window.ethereum) {
      setProvider(new BrowserProvider(window.ethereum));
    }
  }, []);

  const connect = useCallback(async () => {
    setError(null);

    if (!window.ethereum) {
      setError("no_metamask");
      return;
    }

    setConnecting(true);
    try {
      const bp = new BrowserProvider(window.ethereum);
      await bp.send("eth_requestAccounts", []);
      const signer = await bp.getSigner();
      const addr   = await signer.getAddress();
      setProvider(bp);
      setAddress(addr);
      await detectChain(bp);
      refreshOkbondBalance(addr);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err &&
          (err as { code: number | string }).code === 4001) {
        setError("Connection cancelled. Please approve the MetaMask request to continue.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to connect wallet. Please try again.");
      }
    } finally {
      setConnecting(false);
    }
  }, [refreshOkbondBalance]);

  const disconnect = useCallback(async () => {
    try {
      if (window.ethereum?.request) {
        await window.ethereum.request({
          method: "wallet_revokePermissions",
          params: [{ eth_accounts: {} }],
        }).catch(() => { /* not all wallets support this */ });
      }
    } finally {
      setAddress(null);
      setProvider(null);
      setChainId(null);
      setError(null);
      setOkbondBalance(null);
    }
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    const eth = window.ethereum;

    const checkConnection = async () => {
      try {
        const bp       = new BrowserProvider(eth);
        const accounts = await bp.listAccounts();
        if (accounts.length > 0) {
          const addr = accounts[0].address;
          setProvider(bp);
          setAddress(addr);
          await detectChain(bp);
          refreshOkbondBalance(addr);
        }
      } catch { /* not yet connected */ }
    };

    checkConnection();
    eth.on("accountsChanged", handleAccountsChanged);
    eth.on("chainChanged",    handleChainChanged);
    return () => {
      eth.removeListener("accountsChanged", handleAccountsChanged);
      eth.removeListener("chainChanged",    handleChainChanged);
    };
  }, [handleAccountsChanged, handleChainChanged, refreshOkbondBalance]);

  // Refresh OKBOND balance every 60 seconds while connected
  useEffect(() => {
    if (!address) return;
    const id = window.setInterval(() => refreshOkbondBalance(address), 60_000);
    return () => window.clearInterval(id);
  }, [address, refreshOkbondBalance]);

  return {
    address, provider, chainId, isPolygon,
    error, connecting, okbondBalance,
    connect, disconnect, switchToPolygon,
    clearError: () => setError(null),
  };
}
