"use client";
import React, { createContext, useContext, useRef } from "react";
import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

const W3sContext = createContext<W3SSdk | null>(null);

export const W3sProvider = ({ children }: { children: React.ReactNode }) => {
  const sdkRef = useRef<W3SSdk | null>(null);

  if (!sdkRef.current) {
    sdkRef.current = new W3SSdk();
    sdkRef.current.setAppSettings({
      appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID!,
    });
  }

  return (
    <W3sContext.Provider value={sdkRef.current}>{children}</W3sContext.Provider>
  );
};

export const useW3s = () => {
  const ctx = useContext(W3sContext);
  if (!ctx) throw new Error("useW3s must be used within a W3sProvider");
  return ctx;
};
