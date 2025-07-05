"use client";

import { useState } from "react";
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
import Link from "next/link";
import { Heart, Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

export default function SignInPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleContinue = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address.",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast({
          variant: "destructive",
          title: "Invalid Email",
          description: "Please enter a valid email address.",
        });
        setIsLoading(false);
        return;
      }

      // Get Circle App ID
      const configRes = await fetch("/api/circle/config");
      const { appId } = await configRes.json();

      // Create user and wallet using PIN method (no OTP)
      const walletInitRes = await fetch("/api/circle/wallets/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const walletInitData = await walletInitRes.json();

      if (!walletInitRes.ok) {
        throw new Error(walletInitData.error || "Failed to create wallet");
      }

      const { challengeId, userToken, encryptionKey } = walletInitData;

      // Initialize Circle SDK and execute wallet setup
      const sdk = new W3SSdk({ appSettings: { appId } });

      sdk.setAuthentication({
        userToken,
        encryptionKey,
      });

      // Execute the wallet setup challenge
      sdk.execute(challengeId, async (error, result) => {
        if (error) {
          toast({
            variant: "destructive",
            title: "Wallet Setup Failed",
            description: error.message,
          });
          setIsLoading(false);
          return;
        }

        if (result) {
          // Fetch the created wallet address
          const walletListRes = await fetch("/api/circle/wallets/list", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userToken }),
          });
          const walletListData = await walletListRes.json();

          if (!walletListRes.ok) {
            throw new Error(walletListData.error || "Failed to fetch wallet");
          }

          const walletAddress = walletListData.wallets?.[0]?.address;

          toast({
            title: "Wallet Created!",
            description: "Redirecting to account type selection...",
          });

          // Redirect to account type selection with wallet address
          router.push(
            `/account-type-selection?email=${encodeURIComponent(
              email
            )}&wallet=${encodeURIComponent(
              walletAddress || ""
            )}&userToken=${encodeURIComponent(
              userToken
            )}&appId=${encodeURIComponent(appId)}`
          );
        }
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: error.message || "Please try again or contact support.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              teleHealthSol
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <Card className="shadow-2xl w-full max-w-md border-0 rounded-2xl bg-white dark:bg-gray-800">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center items-center mb-4">
              <Heart className="w-12 h-12 text-white bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-2 shadow-lg" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
            <CardDescription>
              Enter your email to get started with teleHealthSol
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleContinue} autoComplete="on">
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

                <Button
                  type="submit"
                  className="w-full mt-2"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Continue
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm text-gray-500">
            <p>
              By continuing, you agree to our{" "}
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

      {/* Back Button at Bottom */}
      <div className="absolute bottom-4 left-4">
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
