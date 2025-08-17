"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCircleWallet } from "@/providers/circle-wallet-provider"
import { Mail, Loader2, Shield, Wallet } from "lucide-react"
import { motion } from "framer-motion"

interface SocialSignInProps {
  onSuccess?: () => void
  title?: string
  description?: string
}

export function SocialSignIn({
  onSuccess,
  title = "Welcome to teleHealthSol",
  description = "Sign in to access your healthcare dashboard",
}: SocialSignInProps) {
  const { connectWallet, isLoading, error, isAvailable } = useCircleWallet()
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setSelectedProvider("google")

    try {
      // Generate mock tokens for demo
      const mockGoogleToken = "google_token_" + Date.now()
      const mockEncryptionKey = "encryption_key_" + Date.now()

      await connectWallet(mockGoogleToken, mockEncryptionKey)
      onSuccess?.()
    } catch (error) {
      console.error("Google sign-in failed:", error)
    } finally {
      setSelectedProvider(null)
    }
  }

  const handleAppleSignIn = async () => {
    setSelectedProvider("apple")

    try {
      const mockAppleToken = "apple_token_" + Date.now()
      const mockEncryptionKey = "encryption_key_" + Date.now()

      await connectWallet(mockAppleToken, mockEncryptionKey)
      onSuccess?.()
    } catch (error) {
      console.error("Apple sign-in failed:", error)
    } finally {
      setSelectedProvider(null)
    }
  }

  const handleEmailSignIn = async () => {
    setSelectedProvider("email")

    try {
      const mockEmailToken = "email_token_" + Date.now()
      const mockEncryptionKey = "encryption_key_" + Date.now()

      await connectWallet(mockEmailToken, mockEncryptionKey)
      onSuccess?.()
    } catch (error) {
      console.error("Email sign-in failed:", error)
    } finally {
      setSelectedProvider(null)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {!isAvailable && (
            <div className="p-3 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 rounded-lg flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Running in demo mode - Circle SDK not available</span>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              {selectedProvider === "google" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            <Button
              onClick={handleAppleSignIn}
              disabled={isLoading}
              className="w-full h-12 bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-black"
            >
              {selectedProvider === "apple" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              )}
              Continue with Apple
            </Button>

            <Separator className="my-4" />

            <Button onClick={handleEmailSignIn} disabled={isLoading} variant="outline" className="w-full h-12">
              {selectedProvider === "email" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              Continue with Email
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Wallet className="w-4 h-4" />
              <span>Secure wallet created automatically</span>
            </div>
            <p className="text-xs">
              {isAvailable ? "Powered by Circle MPC Technology" : "Demo Mode - No real transactions"}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
