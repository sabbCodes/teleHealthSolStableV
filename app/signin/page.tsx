"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Heart, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

export default function SignInPage() {
  const { toast } = useToast();
  const [sdk, setSdk] = useState<W3SSdk | null>(null);
  const [isGoogleLoading, setGoogleLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Initialize SDK only on the client-side
    try {
      const sdkInstance = new W3SSdk();
      setSdk(sdkInstance);
      console.log("[Circle SDK] Instance created");
    } catch (err) {
      console.error("[Circle SDK] Error creating instance:", err);
    }
  }, []);

  useEffect(() => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setIsLoading(false);
  }, [tab]);

  // Add a useEffect to log deviceId fetching
  useEffect(() => {
    const fetchDeviceId = async () => {
      if (!sdk) {
        console.warn("[Circle SDK] SDK not initialized yet");
        return;
      }
      try {
        // Fetch appId from backend for logging
        const configRes = await fetch("/api/circle/config");
        const { appId } = await configRes.json();
        if (!appId) {
          console.error(
            "[Circle SDK] No appId returned from /api/circle/config"
          );
          return;
        }
        console.log("[Circle SDK] Setting app settings with appId:", appId);
        await sdk.setAppSettings({ appId });
        console.log("[Circle SDK] App settings set");

        // Try to get deviceId with retry logic
        let deviceId: string | null = null;
        let retries = 3;

        while (retries > 0 && !deviceId) {
          try {
            console.log(
              `[Circle SDK] Attempting to get deviceId (attempt ${
                4 - retries
              }/3)`
            );
            deviceId = await sdk.getDeviceId();
            console.log("[Circle SDK] deviceId fetched:", deviceId);

            if (!deviceId) {
              console.warn(
                `[Circle SDK] deviceId is null/undefined, retrying... (${
                  retries - 1
                } attempts left)`
              );
              retries--;
              if (retries > 0) {
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retry
              }
            }
          } catch (deviceError) {
            console.error(
              `[Circle SDK] Error getting deviceId (attempt ${4 - retries}/3):`,
              deviceError
            );
            retries--;
            if (retries > 0) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        }

        if (!deviceId) {
          console.error(
            "[Circle SDK] Failed to get deviceId after all retries"
          );
          // Try alternative approach - generate a temporary deviceId
          const tempDeviceId = `temp_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          console.log("[Circle SDK] Using temporary deviceId:", tempDeviceId);
        }
      } catch (err) {
        console.error("[Circle SDK] Error during deviceId fetch:", err);
      }
    };
    fetchDeviceId();
  }, [sdk]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signIn("google", {
        callbackUrl: "/account-type-selection",
        prompt: "select_account",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: "Please try again.",
      });
    }
    setGoogleLoading(false);
  };

  const handleEmailAuth = async (event: React.FormEvent) => {
    console.log("handleEmailAuth called");
    event.preventDefault();
    setIsLoading(true);
    setPasswordError("");

    if (tab === "signup") {
      if (password.length < 8) {
        setPasswordError("Password must be at least 8 characters long.");
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setPasswordError("Passwords do not match.");
        setIsLoading(false);
        return;
      }
    }

    if (!sdk) {
      toast({
        variant: "destructive",
        title: "Wallet SDK not ready",
        description: "Please wait a moment and try again.",
      });
      setIsLoading(false);
      console.error("SDK not ready");
      return;
    }

    try {
      // 1. Set App Settings with your Circle App ID
      console.log("Fetching Circle appId from /api/circle/config...");
      const configRes = await fetch("/api/circle/config");
      const { appId } = await configRes.json();
      console.log("Setting SDK app settings with appId:", appId);
      await sdk.setAppSettings({ appId });

      // 2. Get deviceId from the Circle SDK
      console.log("Getting deviceId from SDK...");
      let deviceId: string | null = null;
      try {
        deviceId = await sdk.getDeviceId();
        console.log("Device ID from SDK:", deviceId, typeof deviceId);
      } catch (err) {
        console.error("Error getting deviceId from SDK:", err);
      }

      if (!deviceId || typeof deviceId !== "string") {
        console.warn("Device ID from SDK failed, trying without deviceId");
        // Try without deviceId first
        deviceId = null;
      }

      // 3. Get OTP tokens from our backend
      console.log("Requesting OTP tokens from backend", { email, deviceId });
      const otpRes = await fetch("/api/circle/users/email/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, deviceId }),
      });
      const otpData = await otpRes.json();
      console.log("OTP backend response:", otpData);
      if (!otpRes.ok)
        throw new Error(otpData.error || "Failed to start email verification.");

      // 4. Extract tokens from backend response
      const { deviceToken, deviceEncryptionKey, otpToken } = otpData;
      console.log("Received from backend:", {
        deviceToken,
        deviceEncryptionKey,
        otpToken,
      });

      // 5. Set authentication with deviceToken and deviceEncryptionKey
      console.log(
        "Setting SDK authentication with deviceToken and deviceEncryptionKey"
      );
      try {
        await sdk.setAuthentication({
          userToken: deviceToken,
          encryptionKey: deviceEncryptionKey,
        });
        console.log("SDK authentication set successfully");
      } catch (authError) {
        console.error("Error setting SDK authentication:", authError);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Failed to authenticate with Circle SDK.",
        });
        setIsLoading(false);
        return;
      }

      // 6. Execute OTP modal using otpToken
      console.log("Executing OTP modal with otpToken:", otpToken);
      console.log("SDK state before execute:", {
        sdk: !!sdk,
        appId: appId,
        deviceToken: !!deviceToken,
        deviceEncryptionKey: !!deviceEncryptionKey,
        otpToken: !!otpToken,
      });

      try {
        sdk.execute(otpToken, async (error, result) => {
          console.log("OTP execute callback triggered", { error, result });
          if (error) {
            console.error("OTP challenge error:", error);
            toast({
              variant: "destructive",
              title: "OTP Verification Failed",
              description: error.message || "An unknown error occurred.",
            });
            setIsLoading(false);
            return;
          }
          console.log("OTP challenge success:", result);

          // 7. After OTP, get userToken and encryptionKey from backend for PIN setup
          try {
            console.log("Requesting userToken and encryptionKey from backend", {
              email,
            });
            const sessionRes = await fetch("/api/circle/session", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: email }),
            });
            const sessionData = await sessionRes.json();
            const { userToken, encryptionKey } = sessionData;

            // 8. Request PIN challenge from backend
            console.log("Requesting PIN challenge from backend", { userToken });
            const pinRes = await fetch("/api/circle/wallets/init", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userToken }),
            });
            const pinData = await pinRes.json();
            console.log("PIN backend response:", pinData);
            if (!pinRes.ok)
              throw new Error(
                pinData.error || "Failed to start wallet PIN setup."
              );

            // 9. Execute PIN challenge (shows Circle's PIN modal)
            console.log(
              "Executing PIN challenge with challengeId:",
              pinData.challengeId
            );
            sdk.execute(pinData.challengeId, (pinError, pinResult) => {
              setIsLoading(false);
              if (pinError) {
                toast({
                  variant: "destructive",
                  title: "Wallet PIN Setup Failed",
                  description: pinError.message || "An unknown error occurred.",
                });
                console.error("PIN challenge error:", pinError);
                return;
              }
              console.log("PIN challenge success:", pinResult);
              router.push("/account-type-selection");
            });
          } catch (pinError) {
            toast({
              variant: "destructive",
              title: "Error",
              description: (pinError as Error).message,
            });
            setIsLoading(false);
            console.error("PIN challenge fetch error:", pinError);
          }
        });
      } catch (otpError) {
        console.error("Error executing OTP modal:", otpError);
        const errorMessage =
          otpError instanceof Error
            ? otpError.message
            : "An unknown error occurred.";
        toast({
          variant: "destructive",
          title: "OTP Execution Error",
          description: errorMessage,
        });
        setIsLoading(false);
      }
    } catch (authError) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: (authError as Error).message,
      });
      setIsLoading(false);
      console.error("handleEmailAuth error:", authError);
    }
    console.log("handleEmailAuth finished");
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      {/* Back to Home button at the top */}
      <div className="w-full flex justify-end mb-8">
        <Link href="/">
          <Button variant="outline" size="sm">
            Back to Home
          </Button>
        </Link>
      </div>
      <Card className="shadow-2xl w-full max-w-md border-0 rounded-2xl bg-white dark:bg-gray-800">
        <CardHeader className="text-center pb-2">
          <Link
            href="/"
            className="flex justify-center items-center mb-4"
            aria-label="teleHealthSol Home"
          >
            <Heart className="w-10 h-10 text-white bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-2 shadow-lg" />
          </Link>
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <CardDescription>
            {tab === "signin"
              ? "Sign in to your account"
              : "Create a new account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tabs for Sign In / Sign Up */}
          <div className="flex mb-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <button
              className={`flex-1 py-2 px-4 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                tab === "signin"
                  ? "bg-white dark:bg-gray-800 text-blue-600 shadow"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500"
              }`}
              onClick={() => setTab("signin")}
              type="button"
              aria-selected={tab === "signin"}
              tabIndex={tab === "signin" ? 0 : -1}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 px-4 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                tab === "signup"
                  ? "bg-white dark:bg-gray-800 text-blue-600 shadow"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500"
              }`}
              onClick={() => setTab("signup")}
              type="button"
              aria-selected={tab === "signup"}
              tabIndex={tab === "signup" ? 0 : -1}
            >
              Sign Up
            </button>
          </div>
          <form onSubmit={handleEmailAuth} autoComplete="on">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="patient@example.com"
                    className="pl-10"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              {tab === "signup" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className="pl-10 pr-10"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={0}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="pl-10 pr-10"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={0}
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        onClick={() => setShowConfirmPassword((v) => !v)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {tab === "signin" && (
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="signin-password"
                      type={showSignInPassword ? "text" : "password"}
                      placeholder="Your password"
                      className="pl-10 pr-10"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      tabIndex={0}
                      aria-label={
                        showSignInPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowSignInPassword((v) => !v)}
                    >
                      {showSignInPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {passwordError && (
                <p className="text-red-500 text-xs mt-1">{passwordError}</p>
              )}
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isLoading || !sdk}
              >
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Continue
              </Button>
            </div>
          </form>

          <div className="relative my-6">
            <Separator />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-white dark:bg-card text-sm text-muted-foreground">
              OR
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 h-4 w-4" />
            )}
            Continue with Google
          </Button>
        </CardContent>
        <CardFooter className="text-center text-sm text-gray-500">
          <p>
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-blue-600">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-blue-600">
              Privacy Policy
            </Link>
            .
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
