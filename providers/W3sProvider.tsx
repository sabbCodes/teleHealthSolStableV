"use client";

import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

interface W3sContextType {
  client: W3SSdk | undefined;
}

const W3sContext = createContext<W3sContextType | undefined>(undefined);

export function useW3s() {
  const context = useContext(W3sContext);
  if (!context) {
    throw new Error("useW3s must be used within a W3sProvider");
  }
  return context;
}

export function W3sProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<W3SSdk>();

  useEffect(() => {
    const web3sdk = new W3SSdk();
    setClient(web3sdk);
  }, []);

  const value = useMemo(() => ({ client }), [client]);

  return <W3sContext.Provider value={value}>{children}</W3sContext.Provider>;
}