"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Search,
  Plus,
  Users,
  Stethoscope,
  ImageIcon,
  FileText,
  Mic,
  MicOff,
  ArrowLeft,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

export default function PatientChatPage() {
  const [selectedChat, setSelectedChat] = useState(1)
  const [message, setMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedChat])

  const doctors = [
    {
      id: 1,
      name: "Dr. Adaora Okafor",
      specialty: "Cardiologist",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Your test results look good. Let's schedule a follow-up.",
      timestamp: "2 min ago",
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: "Dr. Kemi Adebayo",
      specialty: "Dermatologist",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "The medication should help with the symptoms.",
      timestamp: "1 hour ago",
      unread: 0,
      online: false,
    },
    {
      id: 3,
      name: "Dr. Emeka Nwosu",
      specialty: "General Practice",
      avatar: "/placeholder.svg?height=40&width=40",
      lastMessage: "Thank you for the consultation.",
      timestamp: "Yesterday",
      unread: 0,
      online: true,
    },
  ]

  const messages = [
    {
      id: 1,
      sender: "doctor",
      content: "Hello! How are you feeling today?",
      timestamp: "10:30 AM",
      type: "text",
    },
    {
      id: 2,
      sender: "patient",
      content: "Hi Doctor, I'm feeling much better since starting the medication.",
      timestamp: "10:32 AM",
      type: "text",
    },
    {
      id: 3,
      sender: "doctor",
      content: "That's great to hear! Any side effects?",
      timestamp: "10:33 AM",
      type: "text",
    },
    {
      id: 4,
      sender: "patient",
      content: "No side effects so far. Should I continue with the same dosage?",
      timestamp: "10:35 AM",
      type: "text",
    },
    {
      id: 5,
      sender: "doctor",
      content: "Yes, continue for another week. I've uploaded your test results to your medical records.",
      timestamp: "10:37 AM",
      type: "text",
    },
    {
      id: 6,
      sender: "doctor",
      content: "blood_test_results.pdf",
      timestamp: "10:37 AM",
      type: "file",
    },
  ]

  const sendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message)
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const selectedDoctor = doctors.find((doctor) => doctor.id === selectedChat)

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex relative">
      {/* Mobile Overlay */}
      {showSidebar && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowSidebar(false)} />
      )}

      {/* Sidebar - Doctor List */}
      <div
        className={`
        ${showSidebar ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 fixed lg:relative z-50 lg:z-auto
        w-80 lg:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
        flex flex-col transition-transform duration-300 ease-in-out h-full
      `}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Doctors</h1>
            <div className="flex items-center space-x-2">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-green-600">
                <Plus className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="lg:hidden" onClick={() => setShowSidebar(false)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Search doctors..." className="pl-10" />
          </div>
        </div>

        {/* Doctor List */}
        <div className="flex-1 overflow-y-auto">
          {doctors.map((doctor) => (
            <motion.div
              key={doctor.id}
              whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
              onClick={() => {
                setSelectedChat(doctor.id)
                setShowSidebar(false)
              }}
              className={`p-4 cursor-pointer border-b border-gray-100 dark:border-gray-700 ${
                selectedChat === doctor.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={doctor.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {doctor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {doctor.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{doctor.name}</h3>
                    <span className="text-xs text-gray-500">{doctor.timestamp}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{doctor.lastMessage}</p>
                      <div className="flex items-center mt-1">
                        <Stethoscope className="w-3 h-3 text-blue-600 mr-1" />
                        <span className="text-xs text-gray-500">{doctor.specialty}</span>
                      </div>
                    </div>

                    {doctor.unread > 0 && <Badge className="bg-blue-600 text-white text-xs">{doctor.unread}</Badge>}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedDoctor ? (
          <>
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setShowSidebar(true)}>
                    <Menu className="w-4 h-4" />
                  </Button>

                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={selectedDoctor.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {selectedDoctor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {selectedDoctor.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    )}
                  </div>

                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">{selectedDoctor.name}</h2>
                    <div className="flex items-center space-x-2">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{selectedDoctor.specialty}</span>
                      {selectedDoctor.online && <span className="text-sm text-green-600">• Online</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Link href="/payment">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                      End Session
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === "patient" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs sm:max-w-sm lg:max-w-md ${
                        msg.sender === "patient"
                          ? "bg-gradient-to-r from-blue-600 to-green-600 text-white"
                          : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border"
                      } rounded-lg p-3 shadow-sm`}
                    >
                      {msg.type === "file" ? (
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm">{msg.content}</span>
                        </div>
                      ) : (
                        <p className="text-sm break-words">{msg.content}</p>
                      )}
                      <div className={`text-xs mt-1 ${msg.sender === "patient" ? "text-blue-100" : "text-gray-500"}`}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="hidden sm:flex">
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="hidden sm:flex">
                      <Smile className="w-4 h-4" />
                    </Button>
                  </div>

                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="min-h-[60px] resize-none"
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsRecording(!isRecording)}
                    className={isRecording ? "text-red-600" : ""}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>

                  <Button
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Select a doctor</h3>
              <p className="text-gray-600 dark:text-gray-300">Choose a doctor from the sidebar to start messaging</p>
              <Button className="mt-4 lg:hidden" onClick={() => setShowSidebar(true)}>
                <Menu className="w-4 h-4 mr-2" />
                Open Doctor List
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
