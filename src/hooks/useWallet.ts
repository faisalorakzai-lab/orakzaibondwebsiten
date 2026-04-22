import { useState, useCallback, useEffect } from "react";
import { BrowserProvider } from "ethers";

const POLYGON_CHAIN_ID = 137;
const POLYGON_HEX      = "0x89";

export function useWallet() {
  const [address,  setAddress]  = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [chainId,  setChainId]  = useState<number | null>(null);
  const [error,    setError]    = useState<string | null>(null);

  const isPolygon = chainId === POLYGON_CHAIN_ID;

  // ── Detect chain ─────────────────────────────────────────────────────────
  async function detectChain(bp: BrowserProvider) {
    try {
      const net = await bp.getNetwork();
      setChainId(Number(net.chainId));
    } catch { /* ignore */ }
  }

  // ── One-click switch to Polygon ──────────────────────────────────────────
  const switchToPolygon = useCallback(async () => {
    if (!window.ethereum) return;
    setError(null);
    try {
      // Try switching first (works if the chain is already added)
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: POLYGON_HEX }] });
    } catch (switchErr: unknown) {
      // 4902 = chain not added — add it, then switch
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
              rpcUrls: ["https://polygon-rpc.com/", "https://rpc-mainnet.maticvigil.com/"],
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

  // ── Stable event handlers ────────────────────────────────────────────────
  const handleAccountsChanged = useCallback((rawAccounts: unknown) => {
    const accounts = rawAccounts as string[];
    if (accounts.length > 0) {
      setAddress(accounts[0]);
      if (window.ethereum) {
        const bp = new BrowserProvider(window.ethereum);
        setProvider(bp);
        detectChain(bp);
      }
    } else {
      setAddress(null);
      setProvider(null);
    }
  }, []);

  const handleChainChanged = useCallback((chainHex: unknown) => {
    const newId = parseInt(chainHex as string, 16);
    setChainId(isNaN(newId) ? null : newId);
    // Rebuild provider so getSigner() uses the new network
    if (window.ethereum) {
      setProvider(new BrowserProvider(window.ethereum));
    }
  }, []);

  // ── Connect ──────────────────────────────────────────────────────────────
  const connect = useCallback(async () => {
    setError(null);
    if (!window.ethereum) {
      setError("MetaMask is not installed. Please install MetaMask and try again.");
      return;
    }
    try {
      const bp = new BrowserProvider(window.ethereum);
      await bp.send("eth_requestAccounts", []);
      const signer = await bp.getSigner();
      const addr   = await signer.getAddress();
      setProvider(bp);
      setAddress(addr);
      await detectChain(bp);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err &&
          (err as { code: number | string }).code === 4001) {
        setError("Connection rejected. Please approve the MetaMask request.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to connect wallet. Please try again.");
      }
    }
  }, []);

  // ── Auto-detect on mount ─────────────────────────────────────────────────
  useEffect(() => {
    if (!window.ethereum) return;
    const eth = window.ethereum;

    const checkConnection = async () => {
      try {
        const bp       = new BrowserProvider(eth);
        const accounts = await bp.listAccounts();
        if (accounts.length > 0) {
          setProvider(bp);
          setAddress(accounts[0].address);
          await detectChain(bp);
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
  }, [handleAccountsChanged, handleChainChanged]);

  return { address, provider, chainId, isPolygon, error, connect, switchToPolygon };
}
