"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
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
import { supabase } from "@/lib/supabase"
import { formatName } from "@/lib/utils"

export default function PatientChatPage() {
  const [selectedChat, setSelectedChat] = useState(1)
  const [message, setMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()

  // Chat state from Supabase
  const [appointmentId, setAppointmentId] = useState<string | null>(null)
  const [schedule, setSchedule] = useState<null | {
    id: string
    doctor_id: string
    patient_id: string
  }>(null)
  const [authUserId, setAuthUserId] = useState<string | null>(null)
  const [doctorUserId, setDoctorUserId] = useState<string | null>(null)
  const [patientUserId, setPatientUserId] = useState<string | null>(null)
  const [doctorProfile, setDoctorProfile] = useState<
    | null
    | { first_name: string | null; last_name: string | null; profile_image: string | null; specialization: string | null }
  >(null)
  const [messages, setMessages] = useState<
    { id: string; sender: "doctor" | "patient"; content: string; timestamp: string; type: "text" | "file" }[]
  >([])

  // Supabase messages row type
  type MessageRow = {
    id: string
    appointment_id: string
    sender_id: string
    receiver_id: string
    content: string
    created_at: string
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedChat])

  // Also scroll when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Read appointment ID from search params
  useEffect(() => {
    const possibleKeys = ["appointmentId", "appointment_id", "scheduleId", "schedule_id", "id"] as const
    for (const key of possibleKeys) {
      const v = searchParams.get(key as string)
      if (v) {
        setAppointmentId(v)
        break
      }
    }
  }, [searchParams])

  // Get auth user id
  useEffect(() => {
    let isMounted = true
    ;(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (isMounted) setAuthUserId(user?.id ?? null)
    })()
    return () => {
      isMounted = false
    }
  }, [])

  // Fetch schedule once appointmentId is available
  useEffect(() => {
    if (!appointmentId) return
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase.from("schedules").select("id, doctor_id, patient_id").eq("id", appointmentId).single()
      if (error) {
        console.error("Failed to fetch schedule:", error)
        return
      }
      if (!cancelled) setSchedule(data)
    })()
    return () => {
      cancelled = true
    }
  }, [appointmentId])

  // After schedule, resolve doctor/patient to their user_profile_ids
  useEffect(() => {
    if (!schedule) return
    let cancelled = false
    ;(async () => {
      const [{ data: d, error: de }, { data: p, error: pe }] = await Promise.all([
        supabase
          .from("doctor_profiles")
          .select("user_profile_id, first_name, last_name, profile_image, specialization")
          .eq("id", schedule.doctor_id)
          .single(),
        supabase.from("patient_profiles").select("user_profile_id").eq("id", schedule.patient_id).single(),
      ])
      if (de) console.error("Failed to fetch doctor user id:", de)
      if (pe) console.error("Failed to fetch patient user id:", pe)
      if (cancelled) return
      setDoctorUserId(d?.user_profile_id ?? null)
      setPatientUserId(p?.user_profile_id ?? null)
      setDoctorProfile({
        first_name: (d as any)?.first_name ?? null,
        last_name: (d as any)?.last_name ?? null,
        profile_image: (d as any)?.profile_image ?? null,
        specialization: (d as any)?.specialization ?? null,
      })
    })()
    return () => {
      cancelled = true
    }
  }, [schedule])

  // Load messages and subscribe to realtime
  useEffect(() => {
    if (!appointmentId) return
    let cancelled = false

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, appointment_id, sender_id, receiver_id, content, created_at")
        .eq("appointment_id", appointmentId)
        .order("created_at", { ascending: true })
      if (error) {
        console.error("Failed to load messages:", error)
        return
      }
      if (!data || cancelled) return
      const mapped = (data as unknown as MessageRow[]).map((m) => ({
        id: m.id,
        sender: m.sender_id === doctorUserId ? "doctor" : "patient",
        content: m.content,
        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "text" as const,
      }))
      setMessages(mapped)
    }

    loadMessages()

    const channel = supabase
      .channel(`messages-appointment-${appointmentId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `appointment_id=eq.${appointmentId}` },
        (payload) => {
          const m = payload.new as MessageRow
          setMessages((prev) => {
            if (prev.some((pm) => pm.id === m.id)) return prev
            return [
              ...prev,
              {
                id: m.id,
                sender: m.sender_id === doctorUserId ? "doctor" : "patient",
                content: m.content,
                timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                type: "text",
              },
            ]
          })
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [appointmentId, doctorUserId])

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

  // messages are now managed from Supabase state above

  const sendMessage = async () => {
    if (!message.trim() || !appointmentId || !authUserId || !doctorUserId || !patientUserId) return
    const isPatient = authUserId === patientUserId
    const payload = {
      appointment_id: appointmentId,
      sender_id: authUserId,
      receiver_id: isPatient ? doctorUserId : patientUserId,
      content: message.trim(),
    }
    // Optimistic UI
    const tempId = `temp-${Date.now()}`
    const optimistic = {
      id: tempId,
      sender: isPatient ? "patient" as const : "doctor" as const,
      content: payload.content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "text" as const,
    }
    setMessages((prev) => [...prev, optimistic])
    setMessage("")

    const { data, error } = await supabase
      .from("messages")
      .insert(payload)
      .select("id, created_at, sender_id")
      .single()
    if (error) {
      console.error("Failed to send message:", error)
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      return
    }
    if (data) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                id: data.id as string,
                sender: data.sender_id === doctorUserId ? "doctor" : "patient",
                content: optimistic.content,
                timestamp: new Date(String(data.created_at)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                type: "text",
              }
            : m
        )
      )
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const selectedDoctor = doctors.find((doctor) => doctor.id === selectedChat)
  const headerDoctorName = doctorProfile
    ? `${formatName(doctorProfile.first_name ?? "")} ${formatName(doctorProfile.last_name ?? "")}`.trim() || "Doctor"
    : selectedDoctor?.name
  const headerDoctorAvatar = doctorProfile?.profile_image || selectedDoctor?.avatar || "/placeholder.svg"
  const headerDoctorInitials = (headerDoctorName || "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
  const headerDoctorSpecialty = doctorProfile?.specialization || selectedDoctor?.specialty

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
                      <AvatarImage src={headerDoctorAvatar} />
                      <AvatarFallback>{headerDoctorInitials}</AvatarFallback>
                    </Avatar>
                    {selectedDoctor.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    )}
                  </div>

                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">Dr. {headerDoctorName}</h2>
                    <div className="flex items-center space-x-2">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{headerDoctorSpecialty}</span>
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
