"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ChatPage() {
  const router = useRouter()

  useEffect(() => {
    // In a real app, you'd get this from auth context
    const userType = "patient" // or "doctor" based on authentication

    if (userType === "doctor") {
      router.push("/chat/doctor")
    } else {
      router.push("/chat/patient")
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Redirecting to chat...</p>
      </div>
    </div>
  )
}
