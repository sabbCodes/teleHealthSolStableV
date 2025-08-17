// Mock user service for demo purposes
// In production, this would connect to your actual database

interface User {
  id: string
  email: string
  walletAddress: string
  userType: "patient" | "doctor" | "pharmacy"
  firstName: string
  lastName: string
  createdAt: Date
}

interface CreateUserData {
  email: string
  walletAddress: string
  userType: "patient" | "doctor" | "pharmacy"
  firstName: string
  lastName: string
}

class UserService {
  private users: User[] = []

  async findUserByEmail(email: string): Promise<User | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return this.users.find((user) => user.email === email) || null
  }

  async findUserByWalletAddress(walletAddress: string): Promise<User | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return this.users.find((user) => user.walletAddress === walletAddress) || null
  }

  async createUser(userData: CreateUserData): Promise<User> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      ...userData,
      createdAt: new Date(),
    }

    this.users.push(newUser)
    return newUser
  }

  getDashboardRoute(userType: string): string {
    switch (userType) {
      case "doctor":
        return "/doctor-dashboard"
      case "pharmacy":
        return "/pharmacy-dashboard"
      case "admin":
        return "/admin"
      default:
        return "/dashboard"
    }
  }
}

export const userService = new UserService()
