"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState<
    "verifying" | "success" | "error"
  >("verifying");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token_hash");
      const type = searchParams.get("type");
      const next = searchParams.get("next") || "/signin";

      if (type === "signup" && token) {
        try {
          // Verify the email using the token
          const { error } = await AuthService.verifyEmail(token);
          
          if (error) {
            throw new Error(error);
          }

          setVerificationStatus("success");
          
          // Show success toast
          toast({
            title: "Email verified!",
            description: "Your email has been successfully verified. You can now sign in.",
          });

          // Redirect to signin after a short delay
          setTimeout(() => {
            router.push("/signin");
          }, 3000);
          
        } catch (err) {
          console.error("Email verification error:", err);
          setVerificationStatus("error");
          setError(
            err instanceof Error ? err.message : "Failed to verify email. Please try again."
          );
        }
      } else {
        // If no token or wrong type, redirect to home
        router.push("/");
      }
    };

    verifyEmail();
  }, [router, searchParams, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          {verificationStatus === "verifying" && (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold">Verifying your email...</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Please wait while we verify your email address.
              </p>
            </>
          )}

          {verificationStatus === "success" && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold">Email Verified!</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Your email has been successfully verified. Redirecting you to sign in...
              </p>
            </>
          )}

          {verificationStatus === "error" && (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="h-12 w-12 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold">Verification Failed</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {error || "There was an error verifying your email. Please try again."}
              </p>
              <div className="mt-6">
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
