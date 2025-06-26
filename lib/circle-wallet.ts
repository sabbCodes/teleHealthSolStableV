export interface CircleWalletConfig {
  appId: string
  userToken?: string
  encryptionKey?: string
}

export interface WalletResult {
  success: boolean
  data?: any
  error?: string
}

export class CircleWalletService {
  private isInitialized = false
  private sdk: any = null

  constructor(private config: CircleWalletConfig) {}

  async initialize(): Promise<WalletResult> {
    if (this.isInitialized) {
      return { success: true }
    }

    try {
      // Check if we're in browser environment
      if (typeof window === "undefined") {
        return { success: false, error: "Circle wallet only works in browser environment" }
      }

      // Dynamic import to avoid SSR issues
      const { W3SSdk } = await import("@circle-fin/w3s-pw-web-sdk").catch(() => {
        throw new Error("Circle SDK not available")
      })

      this.sdk = new W3SSdk()

      await this.sdk.setAppSettings({
        appId: this.config.appId || "demo-app-id",
      })

      this.isInitialized = true
      console.log("Circle Wallet SDK initialized")
      return { success: true }
    } catch (error) {
      console.error("Failed to initialize Circle Wallet SDK:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to initialize Circle SDK",
      }
    }
  }

  async authenticateUser(idToken: string, encryptionKey: string): Promise<WalletResult> {
    const initResult = await this.initialize()
    if (!initResult.success) {
      return initResult
    }

    try {
      const result = await this.sdk.setAuthentication({
        userToken: idToken,
        encryptionKey: encryptionKey,
      })

      return { success: true, data: result }
    } catch (error) {
      console.error("Authentication failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      }
    }
  }

  async createWallet(): Promise<WalletResult> {
    if (!this.sdk) {
      return { success: false, error: "SDK not initialized" }
    }

    try {
      const result = await this.sdk.execute(
        JSON.stringify({
          challengeId: crypto.randomUUID(),
          operation: "CREATE_WALLET",
        }),
      )

      return { success: true, data: result }
    } catch (error) {
      console.error("Wallet creation failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Wallet creation failed",
      }
    }
  }

  async sendUSDC(to: string, amount: string): Promise<WalletResult> {
    if (!this.sdk) {
      return { success: false, error: "SDK not initialized" }
    }

    try {
      const result = await this.sdk.execute(
        JSON.stringify({
          challengeId: crypto.randomUUID(),
          operation: "SEND_TOKEN",
          params: {
            destinationAddress: to,
            amounts: [amount],
            tokenAddress: "USDC_CONTRACT_ADDRESS", // Replace with actual USDC contract
          },
        }),
      )

      return { success: true, data: result }
    } catch (error) {
      console.error("USDC transfer failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "USDC transfer failed",
      }
    }
  }

  async getBalance(): Promise<WalletResult> {
    if (!this.sdk) {
      return { success: false, error: "SDK not initialized" }
    }

    try {
      const result = await this.sdk.execute(
        JSON.stringify({
          challengeId: crypto.randomUUID(),
          operation: "GET_BALANCE",
        }),
      )

      return { success: true, data: result }
    } catch (error) {
      console.error("Failed to get balance:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get balance",
      }
    }
  }
}

// Create singleton instance with fallback
export const createCircleWallet = () => {
  try {
    return new CircleWalletService({
      appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID || "demo-app-id",
    })
  } catch (error) {
    console.warn("Circle wallet not available:", error)
    return null
  }
}
