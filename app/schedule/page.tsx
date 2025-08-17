"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Calendar,
  MapPin,
  Star,
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Shield,
  Video,
  MessageCircle,
  Phone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export default function SchedulePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const doctorId = searchParams.get("doctorId") || "1"

  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [consultationType, setConsultationType] = useState("video")
  const [symptoms, setSymptoms] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Mock doctor data - in real app, fetch based on doctorId
  const doctor = {
    id: 1,
    name: "Dr. Adaora Okafor",
    specialty: "Cardiologist",
    rating: 4.9,
    reviews: 127,
    location: "Lagos, Nigeria",
    experience: "15 years",
    price: "0.05 SOL",
    priceUSD: "$8.50",
    avatar: "/placeholder.svg?height=80&width=80",
    languages: ["English", "Igbo"],
    verified: true,
    bio: "Dr. Adaora Okafor is a board-certified cardiologist with over 15 years of experience treating heart conditions. She specializes in preventive cardiology and has helped thousands of patients maintain healthy hearts.",
    education: ["MD - University of Lagos", "Cardiology Fellowship - Johns Hopkins"],
    availability: {
      today: ["2:00 PM", "3:30 PM", "5:00 PM"],
      tomorrow: ["9:00 AM", "10:30 AM", "2:00 PM", "4:00 PM"],
      dayAfter: ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM"],
    },
  }

  const consultationTypes = [
    {
      id: "video",
      name: "Video Call",
      icon: Video,
      description: "Face-to-face consultation via video",
      duration: "30 minutes",
    },
    {
      id: "chat",
      name: "Text Chat",
      icon: MessageCircle,
      description: "Text-based consultation",
      duration: "45 minutes",
    },
    {
      id: "phone",
      name: "Phone Call",
      icon: Phone,
      description: "Voice-only consultation",
      duration: "30 minutes",
    },
  ]

  const dates = [
    { value: "today", label: "Today", date: "Dec 15" },
    { value: "tomorrow", label: "Tomorrow", date: "Dec 16" },
    { value: "dayAfter", label: "Day After", date: "Dec 17" },
  ]

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !consultationType) {
      alert("Please fill in all required fields")
      return
    }

    setIsProcessing(true)

    // Simulate booking process
    setTimeout(() => {
      setIsProcessing(false)
      // Redirect to payment with booking details
      router.push(`/payment?doctorId=${doctor.id}&date=${selectedDate}&time=${selectedTime}&type=${consultationType}`)
    }, 2000)
  }

  const getAvailableTimes = () => {
    if (!selectedDate) return []
    return doctor.availability[selectedDate as keyof typeof doctor.availability] || []
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/doctors">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Doctors
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Schedule Appointment</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Doctor Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Doctor Profile */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Doctor Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={doctor.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {doctor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {doctor.verified && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{doctor.name}</h2>
                        {doctor.verified && <Badge className="bg-green-100 text-green-800">Verified</Badge>}
                      </div>

                      <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">{doctor.specialty}</p>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {doctor.location}
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                          {doctor.rating} ({doctor.reviews} reviews)
                        </div>
                        <div>{doctor.experience} experience</div>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{doctor.bio}</p>

                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Education:</span>
                          <ul className="text-sm text-gray-600 dark:text-gray-300 ml-4">
                            {doctor.education.map((edu, index) => (
                              <li key={index}>• {edu}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Languages:</span>
                          <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
                            {doctor.languages.join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Consultation Type */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Consultation Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {consultationTypes.map((type) => (
                      <div
                        key={type.id}
                        onClick={() => setConsultationType(type.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          consultationType === type.id
                            ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              consultationType === type.id
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            <type.icon className="w-4 h-4" />
                          </div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{type.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{type.description}</p>
                        <p className="text-xs text-gray-500">{type.duration}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Date & Time Selection */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Select Date & Time</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Preferred Date
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {dates.map((date) => (
                        <button
                          key={date.value}
                          onClick={() => {
                            setSelectedDate(date.value)
                            setSelectedTime("") // Reset time when date changes
                          }}
                          className={`p-3 text-center border-2 rounded-lg transition-all ${
                            selectedDate === date.value
                              ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                          }`}
                        >
                          <div className="font-medium text-gray-900 dark:text-white">{date.label}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">{date.date}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Selection */}
                  {selectedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Available Times
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {getAvailableTimes().map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`p-3 text-center border-2 rounded-lg transition-all ${
                              selectedTime === time
                                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                            }`}
                          >
                            <div className="font-medium text-gray-900 dark:text-white">{time}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Symptoms/Reason */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Reason for Visit (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Please describe your symptoms or reason for consultation..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    This helps the doctor prepare for your consultation and provide better care.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    Booking Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Doctor:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{doctor.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Specialty:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{doctor.specialty}</span>
                    </div>
                    {selectedDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Date:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {dates.find((d) => d.value === selectedDate)?.label} (
                          {dates.find((d) => d.value === selectedDate)?.date})
                        </span>
                      </div>
                    )}
                    {selectedTime && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Time:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{selectedTime}</span>
                      </div>
                    )}
                    {consultationType && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Type:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {consultationTypes.find((t) => t.id === consultationType)?.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Consultation Fee:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{doctor.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Platform Fee:</span>
                      <span className="font-medium text-gray-900 dark:text-white">0.005 SOL</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>0.055 SOL</span>
                    </div>
                    <div className="text-center text-sm text-gray-500">≈ $9.35 USD</div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Secure Payment</span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                      Payment is held in escrow and released to the doctor only after consultation completion.
                    </p>
                  </div>

                  <Button
                    onClick={handleBooking}
                    disabled={!selectedDate || !selectedTime || !consultationType || isProcessing}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  >
                    {isProcessing ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Proceed to Payment
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
