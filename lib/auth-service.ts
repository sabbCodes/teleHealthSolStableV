// This is a mock authentication service for frontend development
// Replace with actual backend integration later

interface SignUpOptions {
  email: string
  password: string
  userData: Record<string, any>
}

interface SignInOptions {
  email: string
  password: string
}

interface AuthResponse {
  success: boolean
  user?: {
    id: string
    email: string
    userData: Record<string, any>
  }
  session?: {
    token: string
  }
  error?: string
}

// Simple in-memory storage for demo purposes
const users: Record<string, any> = {}

export const authService = {
  signUp: async ({ email, password, userData }: SignUpOptions): Promise<AuthResponse> => {
    console.log("Mock signup:", { email, password, userData })

    // Check if user already exists
    if (users[email]) {
      return {
        success: false,
        error: "User already exists",
      }
    }

    // Create new user
    const userId = `user_${Date.now()}`
    users[email] = {
      id: userId,
      email,
      password, // In a real app, this would be hashed
      userData,
    }

    // Simulate email verification required
    return {
      success: true,
      user: {
        id: userId,
        email,
        userData,
      },
      // No session means email verification required
    }
  },

  signIn: async ({ email, password }: SignInOptions): Promise<AuthResponse> => {
    console.log("Mock signin:", { email, password })

    // Check if user exists and password matches
    if (!users[email] || users[email].password !== password) {
      return {
        success: false,
        error: "Invalid email or password",
      }
    }

    // Return user and session
    return {
      success: true,
      user: {
        id: users[email].id,
        email,
        userData: users[email].userData,
      },
      session: {
        token: `token_${Date.now()}`,
      },
    }
  },

  verifyEmail: async (token: string): Promise<AuthResponse> => {
    // In a real app, this would verify the token
    return {
      success: true,
    }
  },
}
