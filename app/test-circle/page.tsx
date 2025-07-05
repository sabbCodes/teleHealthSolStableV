"use client";
import { useState } from "react";
import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

export default function TestCirclePage() {
  const appId = process.env.NEXT_PUBLIC_CIRCLE_APP_ID || "";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setStatus(null);
    setError(null);
    setLoading(true);
    if (!appId || !email) {
      setError("App ID and email are required.");
      setLoading(false);
      return;
    }
    try {
      // 1. Generate idempotency key
      const idempotencyKey = crypto.randomUUID();
      // 2. Get deviceId from SDK
      const sdk = new W3SSdk({ appSettings: { appId } });
      let deviceId: string | null = null;
      try {
        deviceId = await sdk.getDeviceId();
      } catch (err) {
        setError("Failed to get deviceId from SDK: " + (err as Error).message);
        setLoading(false);
        return;
      }
      // 3. Get OTP tokens from backend
      const otpRes = await fetch("/api/circle/users/email/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, idempotencyKey, deviceId }),
      });
      const otpData = await otpRes.json();
      if (!otpRes.ok)
        throw new Error(otpData.error || "Failed to get OTP tokens");
      const { deviceToken, deviceEncryptionKey, otpToken } = otpData;
      if (!deviceToken || !deviceEncryptionKey || !otpToken)
        throw new Error(
          "Missing deviceToken, deviceEncryptionKey, or otpToken"
        );
      // 4. Update SDK configs
      sdk.updateConfigs({
        appSettings: { appId },
        loginConfigs: {
          deviceToken,
          deviceEncryptionKey,
          otpToken,
        },
      });
      // 5. Listen for OTP verification event
      const handleLoginMessage = async (event: MessageEvent) => {
        if (
          event.origin !== "https://pw-auth.circle.com" ||
          !event.data?.onEmailLoginVerified
        ) {
          return;
        }
        window.removeEventListener("message", handleLoginMessage);
        const { error: otpError, result } = event.data.onEmailLoginVerified;
        if (otpError) {
          setError(
            "OTP verification failed: " + (otpError.message || "Unknown error")
          );
          setLoading(false);
          return;
        }
        if (!result?.userToken || !result?.encryptionKey) {
          setError("OTP verified but missing userToken or encryptionKey");
          setLoading(false);
          return;
        }
        setStatus("OTP verified! Proceeding to wallet setup...");
        // 6. Get challengeId from backend (now creates user and uses SCA)
        try {
          const walletInitRes = await fetch("/api/circle/wallets/init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userToken: result.userToken,
              email: email,
            }),
          });
          const walletInitData = await walletInitRes.json();
          if (!walletInitRes.ok)
            throw new Error(
              walletInitData.error || "Failed to get challengeId"
            );
          const {
            challengeId,
            userToken: newUserToken,
            encryptionKey: newEncryptionKey,
          } = walletInitData;
          if (!challengeId) throw new Error("No challengeId returned");

          // Use the new user token and encryption key from the backend
          const finalUserToken = newUserToken || result.userToken;
          const finalEncryptionKey = newEncryptionKey || result.encryptionKey;

          // 7. Run the SDK test for wallet setup
          sdk.setAuthentication({
            userToken: finalUserToken,
            encryptionKey: finalEncryptionKey,
          });
          console.log("About to execute challengeId:", challengeId);
          console.log("SDK state before execute:", {
            appId: appId,
            isAuthenticated: !!finalUserToken,
            challengeIdLength: challengeId?.length,
            challengeIdFormat: challengeId?.includes("-")
              ? "UUID-like"
              : "other",
            accountType: "EOA", // Using EOA for Solana
            blockchain: "SOL-DEVNET", // Using SOL-DEVNET for Solana
          });
          sdk.execute(challengeId, (pinError, pinResult) => {
            console.log("SDK execute callback fired immediately");
            console.log("Checking for modal elements in DOM...");
            // Check for iframes or modals
            const iframes = document.querySelectorAll("iframe");
            const modals = document.querySelectorAll(
              "[class*='modal'], [class*='popup'], [class*='overlay']"
            );
            console.log("Found iframes:", iframes.length);
            console.log("Found potential modals:", modals.length);
            iframes.forEach((iframe, i) => {
              console.log(
                `Iframe ${i}:`,
                iframe.src,
                iframe.style.display,
                iframe.style.visibility
              );
            });
            modals.forEach((modal, i) => {
              const modalElement = modal as HTMLElement;
              console.log(
                `Modal ${i}:`,
                modal.className,
                modalElement.style.display,
                modalElement.style.visibility
              );
            });
            setLoading(false);
            if (pinError) {
              setError(
                `${pinError?.code?.toString() || "Unknown code"}: ${
                  pinError?.message ?? "Error!"
                }`
              );
              return;
            }
            setStatus(
              `Challenge: ${pinResult?.type}, status: ${pinResult?.status}`
            );
            setStatus(
              (prev) => `${prev}\nResult: ${JSON.stringify(pinResult, null, 2)}`
            );
          });
        } catch (walletErr: any) {
          setError(walletErr.message || "Wallet setup error");
          setLoading(false);
        }
      };
      window.addEventListener("message", handleLoginMessage);
      // 6. Show OTP modal
      sdk.verifyOtp();
      setStatus("OTP modal opened. Please check your email and enter the OTP.");
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Unknown error");
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 500, margin: "0 auto" }}>
      <h1>Circle SDK Minimal Test (Updated for EOA)</h1>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 4 }}>
          App ID (from env):
        </label>
        <input
          value={appId}
          disabled
          style={{ width: "100%", marginBottom: 8 }}
        />
        <label style={{ display: "block", marginBottom: 4 }}>Email:</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
      </div>
      <button
        onClick={handleTest}
        disabled={loading}
        style={{
          padding: "8px 24px",
          fontWeight: 600,
          background: loading ? "#94a3b8" : "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Running..." : "Run Test"}
      </button>
      {error && <div style={{ color: "red", marginTop: 16 }}>{error}</div>}
      {status && <pre style={{ color: "green", marginTop: 16 }}>{status}</pre>}
      <p style={{ marginTop: 32 }}>
        Enter your email and click <b>Run Test</b>. The Circle OTP modal should
        appear. Complete the OTP flow to continue to wallet setup.
        <br />
        <strong>
          Updated to use EOA account type and SOL-DEVNET blockchain for Solana.
        </strong>
        <br />
        Check the browser console for additional output.
      </p>
    </div>
  );
}
