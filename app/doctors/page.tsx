"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, Star, MapPin, Clock, MessageCircle, Video, Calendar, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function DoctorsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")
  const [showChatbot, setShowChatbot] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    {
      type: "bot",
      message:
        "Hi! I'm your AI health assistant. Tell me about your symptoms and I'll suggest the right specialist for you.",
    },
  ])
  const [currentMessage, setCurrentMessage] = useState("")

  const doctors = [
    {
      id: 1,
      name: "Dr. Adaora Okafor",
      specialty: "Cardiologist",
      rating: 4.9,
      reviews: 127,
      location: "Lagos, Nigeria",
      experience: "15 years",
      price: "0.05 SOL",
      availability: "Available now",
      avatar: "/placeholder.svg?height=80&width=80",
      languages: ["English", "Igbo"],
      verified: true,
    },
    {
      id: 2,
      name: "Dr. Kemi Adebayo",
      specialty: "Dermatologist",
      rating: 4.8,
      reviews: 89,
      location: "Abuja, Nigeria",
      experience: "12 years",
      price: "0.04 SOL",
      availability: "Available in 30 min",
      avatar: "/placeholder.svg?height=80&width=80",
      languages: ["English", "Yoruba"],
      verified: true,
    },
    {
      id: 3,
      name: "Dr. Emeka Nwosu",
      specialty: "General Practice",
      rating: 4.7,
      reviews: 203,
      location: "Port Harcourt, Nigeria",
      experience: "10 years",
      price: "0.03 SOL",
      availability: "Available now",
      avatar: "/placeholder.svg?height=80&width=80",
      languages: ["English", "Igbo"],
      verified: true,
    },
  ]

  const specialties = [
    "All Specialties",
    "General Practice",
    "Cardiologist",
    "Dermatologist",
    "Pediatrician",
    "Gynecologist",
    "Psychiatrist",
  ]

  const sendMessage = () => {
    if (!currentMessage.trim()) return

    const newMessages = [
      ...chatMessages,
      { type: "user", message: currentMessage },
      {
        type: "bot",
        message:
          "Based on your symptoms, I recommend consulting with a Cardiologist. Dr. Adaora Okafor is highly rated and available now.",
      },
    ]

    setChatMessages(newMessages)
    setCurrentMessage("")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Find a Doctor</h1>
            <Button
              onClick={() => setShowChatbot(true)}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              <Bot className="w-4 h-4 mr-2" />
              AI Triage
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search doctors, specialties, or symptoms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty.toLowerCase().replace(" ", "-")}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </header>

      {/* Doctors Grid */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor, index) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={doctor.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {doctor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{doctor.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{doctor.specialty}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{doctor.rating}</span>
                          <span className="text-sm text-gray-500">({doctor.reviews})</span>
                        </div>
                      </div>
                    </div>
                    {doctor.verified && <Badge className="bg-green-100 text-green-800">Verified</Badge>}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <MapPin className="w-4 h-4 mr-2" />
                      {doctor.location}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Clock className="w-4 h-4 mr-2" />
                      {doctor.experience} experience
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Consultation fee:</span>
                      <span className="font-semibold text-green-600">{doctor.price}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant={doctor.availability.includes("now") ? "default" : "secondary"}>
                      {doctor.availability}
                    </Badge>
                    <div className="flex space-x-1">
                      {doctor.languages.map((lang) => (
                        <Badge key={lang} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link href={`/schedule?doctorId=${doctor.id}`} className="flex-1">
                      <Button size="sm" className="w-full">
                        <Calendar className="w-4 h-4 mr-1" />
                        Book
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Video className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Chatbot Modal */}
      <AnimatePresence>
        {showChatbot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowChatbot(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md h-96 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">AI Health Assistant</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowChatbot(false)}>
                  ×
                </Button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {chatMessages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs p-3 rounded-lg ${
                        msg.type === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Describe your symptoms..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button onClick={sendMessage}>Send</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
