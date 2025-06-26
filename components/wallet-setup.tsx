"use client";
import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface WalletSetupProps {
  userToken: string;
  appId: string;
  onComplete: () => void;
  onError: (error: Error) => void;
}

export function WalletSetup({
  userToken,
  appId,
  onComplete,
  onError,
}: WalletSetupProps) {
  const { toast } = useToast();

  useEffect(() => {
    const setupWallet = async () => {
      try {
        const initResponse = await fetch("/api/circle/wallets/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userToken }),
        });
        const initData = await initResponse.json();
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
        const { challengeId } = initData;
        const circle = new W3SSdk({ appSettings: { appId } });
        circle.execute(challengeId, (error, result) => {
          if (error) {
            onError(error as Error);
            return;
          }
          if (result) {
            toast({
              title: "Wallet Created!",
              description: "Your secure wallet has been successfully set up.",
            });
            onComplete();
          }
        });
      } catch (error) {
        onError(error as Error);
      }
    };
    setupWallet();
  }, [userToken, appId, onComplete, onError, toast]);

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
