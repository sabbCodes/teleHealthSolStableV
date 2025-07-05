"use client";
import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface WalletSetupProps {
  userToken: string;
  appId: string;
  email?: string;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export function WalletSetup({
  userToken,
  appId,
  email,
  onComplete,
  onError,
}: WalletSetupProps) {
  const { toast } = useToast();

  useEffect(() => {
    const setupWallet = async () => {
      try {
        console.log("[WalletSetup] Starting wallet setup with:", {
          userToken: userToken.substring(0, 10) + "...",
          appId,
          email,
        });

        const initResponse = await fetch("/api/circle/wallets/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userToken,
            email: email || "unknown@example.com", // Fallback if email not provided
          }),
        });
        const initData = await initResponse.json();
        console.log("[WalletSetup] Init response:", initData);

        if (!initResponse.ok) {
          if (initData.details?.message?.includes("already been initialized")) {
            toast({
              title: "Welcome Back!",
              description: "Your wallet is already set up.",
            });
            onComplete();
            return;
          }
          throw new Error(
            initData.details?.message ||
              initData.error ||
              "Failed to initialize wallet setup"
          );
        }

        const {
          challengeId,
          userToken: newUserToken,
          encryptionKey: newEncryptionKey,
        } = initData;

        // Use the new user token and encryption key from the backend
        const finalUserToken = newUserToken || userToken;
        const finalEncryptionKey = newEncryptionKey || "default-key";

        console.log("[WalletSetup] About to execute challengeId:", challengeId);

        const circle = new W3SSdk({ appSettings: { appId } });

        // Set authentication with the new tokens
        circle.setAuthentication({
          userToken: finalUserToken,
          encryptionKey: finalEncryptionKey,
        });

        circle.execute(challengeId, (error, result) => {
          if (error) {
            console.error("[WalletSetup] Execute error:", error);
            onError(error as Error);
            return;
          }
          if (result) {
            console.log("[WalletSetup] Execute success:", result);
            toast({
              title: "Wallet Created!",
              description: "Your secure wallet has been successfully set up.",
            });
            onComplete();
          }
        });
      } catch (error) {
        console.error("[WalletSetup] Setup error:", error);
        onError(error as Error);
      }
    };
    setupWallet();
  }, [userToken, appId, email, onComplete, onError, toast]);

  return (
    <div className="text-center">
      <p className="mb-4">
        Please follow the instructions in the popup to set up your secure PIN.
      </p>
      <p className="text-sm text-muted-foreground">
        This will create your user-controlled wallet.
      </p>
    </div>
  );
}
