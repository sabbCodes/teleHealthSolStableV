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
import { useToast } from "@/hooks/use-toast";
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
  const [pendingWalletUserToken, setPendingWalletUserToken] = useState<
    string | null
  >(null);
  const [pendingWalletEmail, setPendingWalletEmail] = useState<string | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    // The onLoginComplete callback is NOT firing consistently for the OTP flow.
    // We will initialize the SDK here, and handle the OTP response via a manual
    // message listener inside the `handleEmailAuth` function.
    const sdkInstance = new W3SSdk();
    setSdk(sdkInstance);
    console.log("[Circle SDK] Instance created.");
  }, []);

  // Effect to clear form state when switching between sign-in/sign-up
  useEffect(() => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setIsLoading(false);
  }, [tab]);

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
      return;
    }

    try {
      // 1. Get Circle App ID
      const configRes = await fetch("/api/circle/config");
      const { appId } = await configRes.json();
      sdk.setAppSettings({ appId });

      // 2. Get deviceId (best effort)
      let deviceId: string | null = null;
      try {
        deviceId = await sdk.getDeviceId();
      } catch (err) {
        console.warn("Could not get deviceId from SDK, proceeding without it.");
      }

      // 3. Get OTP tokens from our backend
      const otpRes = await fetch("/api/circle/users/email/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, deviceId }),
      });
      const otpData = await otpRes.json();
      if (!otpRes.ok)
        throw new Error(otpData.error || "Failed to start email verification.");

      // 4. Update SDK configs
      const { deviceToken, deviceEncryptionKey, otpToken } = otpData;
      sdk.updateConfigs({
        appSettings: { appId },
        loginConfigs: {
          deviceToken,
          deviceEncryptionKey,
          otpToken,
        },
      });

      // 5. Setup the manual listener to handle the OTP result
      const handleLoginMessage = async (event: MessageEvent) => {
        if (
          event.origin !== "https://pw-auth.circle.com" ||
          !event.data?.onEmailLoginVerified
        ) {
          return;
        }

        console.log(
          "--- [SUCCESS] Manual listener caught onEmailLoginVerified event ---"
        );
        window.removeEventListener("message", handleLoginMessage); // Clean up immediately

        const { error, result } = event.data.onEmailLoginVerified;

        if (error) {
          console.error(
            "[Circle SDK] OTP verification error from listener:",
            error
          );
          toast({
            variant: "destructive",
            title: "OTP Verification Failed",
            description: error.message || "An unexpected error occurred.",
          });
          setIsLoading(false);
          return;
        }

        if (result) {
          toast({
            title: "OTP Verified!",
            description: "Proceeding to wallet setup...",
          });

          try {
            // Set authentication on the SDK with the fresh tokens
            sdk.setAuthentication({
              userToken: result.userToken,
              encryptionKey: result.encryptionKey,
            });

            // Use THIS userToken for wallet setup
            const walletInitRes = await fetch("/api/circle/wallets/init", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userToken: result.userToken }),
            });
            if (!walletInitRes.ok)
              throw new Error((await walletInitRes.json()).error);

            const { challengeId } = await walletInitRes.json();

            console.log(
              "[Circle SDK] About to execute challengeId:",
              challengeId
            );
            sdk.execute(challengeId, (pinError, pinResult) => {
              setIsLoading(false);
              if (pinError) {
                console.error("[Circle SDK] PIN/Recovery UI error:", pinError);
                toast({
                  variant: "destructive",
                  title: "Wallet Setup Failed",
                  description: pinError.message,
                });
                return;
              }
              console.log(
                "[Circle SDK] PIN/Recovery UI completed. pinResult:",
                pinResult
              );
              // Set state to trigger wallet fetch and redirect in useEffect
              setPendingWalletUserToken(result.userToken);
              setPendingWalletEmail(email);
            });
          } catch (flowError) {
            console.error("[App] Error during post-OTP flow:", flowError);
            toast({
              variant: "destructive",
              title: "Account Creation Failed",
              description: (flowError as Error).message,
            });
            setIsLoading(false);
          }
        }
      };

      window.addEventListener("message", handleLoginMessage);

      // 6. Call verifyOtp to show the UI
      sdk.verifyOtp();
    } catch (authError) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: (authError as Error).message,
      });
      setIsLoading(false);
      console.error("handleEmailAuth error:", authError);
    }
  };

  useEffect(() => {
    if (!pendingWalletUserToken || !pendingWalletEmail) return;
    (async () => {
      setIsLoading(true);
      try {
        // Fetch wallet address using backend API (to keep API key secret)
        const walletListRes = await fetch("/api/circle/wallets/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userToken: pendingWalletUserToken }),
        });
        if (!walletListRes.ok)
          throw new Error((await walletListRes.json()).error);
        const { wallets } = await walletListRes.json();
        const walletAddress = wallets?.[0]?.address;
        toast({
          title: "Wallet Created!",
          description: "Redirecting to account setup...",
        });
        router.push(
          `/account-type-selection?email=${encodeURIComponent(
            pendingWalletEmail
          )}&wallet=${walletAddress || ""}`
        );
      } catch (fetchError) {
        console.error("[App] Error fetching wallet address:", fetchError);
        toast({
          variant: "destructive",
          title: "Failed to fetch wallet address",
          description: (fetchError as Error).message,
        });
      } finally {
        setIsLoading(false);
        setPendingWalletUserToken(null);
        setPendingWalletEmail(null);
      }
    })();
  }, [pendingWalletUserToken, pendingWalletEmail]);

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
