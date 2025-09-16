"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Search,
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
  // Track the currently selected doctor's ID (string type to match database IDs)
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
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
  const [doctorProfile, setDoctorProfile] = useState<{
    id: string;
    first_name: string | null;
    last_name: string | null;
    profile_image: string | null;
    specialization: string | null;
  } | null>(null)
  
  const [doctors, setDoctors] = useState<Array<{
    id: string;
    name: string;
    specialty: string;
    avatar: string;
    lastMessage: string;
    timestamp: string;
    unread: number;
    online: boolean;
  }>>([]);
  
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
      const v = searchParams?.get(key as string)
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

  // After schedule, resolve doctor/patient to their user_profile_ids and fetch patient's doctors
  useEffect(() => {
    if (!schedule) return;
    let cancelled = false;
    
    // Define types for the data
  type DoctorData = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    profile_image: string | null;
    specialization: string | null;
    user_profile_id?: string;
  };

  // Debug function to log doctor data
  const logDoctorData = (doctor: DoctorData | null, label: string) => {
    console.log(`[${label}]`, {
      id: doctor?.id,
      name: doctor ? `${doctor.first_name} ${doctor.last_name}` : 'No doctor',
      user_profile_id: doctor?.user_profile_id
    });
  };
    
    const fetchData = async () => {
      try {
        console.log('Fetching doctor with ID:', schedule.doctor_id);
        
        // First, fetch the current doctor and patient data in parallel
        const [
          { data: currentDoctor, error: de },
          { data: patient, error: pe }
        ] = await Promise.all([
          supabase
            .from("doctor_profiles")
            .select("id, user_profile_id, first_name, last_name, profile_image, specialization")
            .eq("id", schedule.doctor_id)
            .single(),
          supabase
            .from("patient_profiles")
            .select("user_profile_id")
            .eq("id", schedule.patient_id)
            .single()
        ]);

        // Then fetch the patient's schedules with doctor information
        const { data: patientSchedules, error: pde } = await supabase
          .from("schedules")
          .select(
            `
            id,
            doctor:doctor_profiles!inner(
              id,
              first_name,
              last_name,
              profile_image,
              specialization,
              user_profile_id
            )
          `,
            { count: 'exact' }
          )
          .eq("patient_id", schedule.patient_id)
          .order("created_at", { ascending: false });

        if (de) console.error("Failed to fetch doctor user id:", de);
        if (pe) console.error("Failed to fetch patient user id:", pe);
        if (pde) console.error("Failed to fetch patient's doctors:", pde);
        
        if (cancelled) return;
        
        // Debug log the current doctor data
        logDoctorData(currentDoctor, 'Current Doctor');
        console.log('Patient Schedules:', patientSchedules);

        // Set the current doctor's user ID and profile
        if (currentDoctor) {
          setDoctorUserId(currentDoctor.user_profile_id ?? null);
          setDoctorProfile({
            id: currentDoctor.id,
            first_name: currentDoctor.first_name,
            last_name: currentDoctor.last_name,
            profile_image: currentDoctor.profile_image,
            specialization: currentDoctor.specialization,
          });
        }

        // Set the patient's user ID
        if (patient) {
          setPatientUserId(patient.user_profile_id ?? null);
        }

        // Process and set the doctors list
        if (patientSchedules) {
          const uniqueDoctors = new Map<string, DoctorData>();
          
          // Add current doctor first if exists (this ensures they're always included)
          if (currentDoctor) {
            console.log('Adding current doctor to uniqueDoctors:', currentDoctor.id);
            uniqueDoctors.set(currentDoctor.id, {
              id: currentDoctor.id,
              first_name: currentDoctor.first_name,
              last_name: currentDoctor.last_name,
              profile_image: currentDoctor.profile_image,
              specialization: currentDoctor.specialization,
              user_profile_id: currentDoctor.user_profile_id
            });
          } else {
            console.error('Current doctor is null or undefined');
          }
          
          // Add other doctors from schedules
          patientSchedules.forEach((schedule: { doctor?: DoctorData | DoctorData[] }) => {
            try {
              // Handle both array and single doctor cases
              const doctors = Array.isArray(schedule.doctor) 
                ? schedule.doctor
                : schedule.doctor ? [schedule.doctor] : [];
              
          doctors.forEach((doctor: DoctorData) => {
                if (doctor?.id && !uniqueDoctors.has(doctor.id)) {
                  // Ensure the doctor object matches the DoctorData type
                  const doctorData: DoctorData = {
                    id: doctor.id,
                    first_name: doctor.first_name ?? null,
                    last_name: doctor.last_name ?? null,
                    profile_image: doctor.profile_image ?? null,
                    specialization: doctor.specialization ?? null,
                    user_profile_id: doctor.user_profile_id
                  };
                  uniqueDoctors.set(doctor.id, doctorData);
                }
              });
            } catch (error) {
              console.error('Error processing schedule:', schedule, error);
            }
          });
          
          // Transform to the required format for the UI
          const formattedDoctors = Array.from(uniqueDoctors.values()).map(doctor => ({
            id: doctor.id,
            name: `Dr. ${doctor.first_name || ''} ${doctor.last_name || ''}`.trim() || 'Doctor',
            specialty: doctor.specialization || 'General Practice',
            avatar: doctor.profile_image || "/placeholder.svg?height=40&width=40",
            lastMessage: messages.length > 0 ? messages[messages.length - 1].content : "No messages yet",
            timestamp: messages.length > 0 ? messages[messages.length - 1].timestamp : "",
            unread: 0, // You can implement unread count logic if needed
            online: true, // You can implement online status if needed
          }));
          
          setDoctors(formattedDoctors);
          
          // Set the first doctor as selected if none is selected
          if (formattedDoctors.length > 0 && !selectedChat) {
            setSelectedChat(formattedDoctors[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    
    return () => {
      cancelled = true;
    };
  }, [schedule, messages, selectedChat]);

  // Load messages and subscribe to realtime
  useEffect(() => {
    if (!appointmentId || !doctorUserId || !patientUserId) return
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
      
      const mapped = (data as unknown as MessageRow[]).map((m) => {
        const sender: 'doctor' | 'patient' = m.sender_id === doctorUserId ? 'doctor' : 'patient';
        return {
          id: m.id,
          sender,
          content: m.content,
          timestamp: new Date(m.created_at).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
          }),
          type: 'text' as const,
        };
      });
      
      if (!cancelled) {
        setMessages(mapped)
      }
    }

    loadMessages()

    // Track processed message IDs to prevent duplicates
    const processedMessageIds = new Set<string>()
    let channel: ReturnType<typeof supabase.channel> | null = null

    // Only set up the channel if we have all required IDs
    if (appointmentId && doctorUserId && patientUserId) {
      channel = supabase
        .channel(`messages-appointment-${appointmentId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `appointment_id=eq.${appointmentId}`
          },
          (payload) => {
            const m = payload.new as MessageRow
            
            // Skip if we've already processed this message
            if (processedMessageIds.has(m.id)) {
              console.log('Skipping duplicate message:', m.id)
              return
            }
            
            // Add to processed messages
            processedMessageIds.add(m.id)
            
            // Only keep the last 100 message IDs to prevent memory leaks
            if (processedMessageIds.size > 100) {
              const ids = Array.from(processedMessageIds).slice(-100)
              processedMessageIds.clear()
              ids.forEach(id => processedMessageIds.add(id))
            }
            
            // Only add the message if it's not from the current user
            // (since we already added it optimistically)
            if (m.sender_id === authUserId) {
              console.log('Skipping own message in realtime update:', m.id)
              return
            }
            
            setMessages((prev) => {
              // Check if message already exists (by ID or content + timestamp)
              const messageExists = prev.some(pm => 
                pm.id === m.id || 
                (pm.content === m.content && 
                 Math.abs(new Date(pm.timestamp).getTime() - new Date(m.created_at).getTime()) < 1000)
              )
              
              if (messageExists) return prev
              
              return [
                ...prev,
                {
                  id: m.id,
                  sender: m.sender_id === doctorUserId ? "doctor" : "patient",
                  content: m.content,
                  timestamp: new Date(m.created_at).toLocaleTimeString([], { 
                    hour: "2-digit", 
                    minute: "2-digit" 
                  }),
                  type: "text",
                },
              ]
            })
          }
        )
        .subscribe()
    }

    return () => {
      cancelled = true
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [appointmentId, doctorUserId, patientUserId, authUserId])

  // Doctors list is now managed in state and populated from the database

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

  // Find the currently selected doctor, defaulting to the first doctor if none selected
  const selectedDoctor = doctors.find((doctor) => doctor.id === selectedChat) || doctors[0]
  const headerDoctorName = doctorProfile
    ? `Dr. ${formatName(doctorProfile.first_name ?? '')} ${formatName(doctorProfile.last_name ?? '')}`.trim() || 'Doctor'
    : selectedDoctor?.name || 'Doctor'
  const headerDoctorAvatar = doctorProfile?.profile_image || selectedDoctor?.avatar || "/placeholder.svg"
  const headerDoctorInitials = (headerDoctorName || "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
  const headerDoctorSpecialty = doctorProfile?.specialization || selectedDoctor?.specialty || 'General Practice'

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
                    <h2 className="font-semibold text-gray-900 dark:text-white">{headerDoctorName}</h2>
                    <div className="flex items-center space-x-2">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{headerDoctorSpecialty}</span>
                      {selectedDoctor.online && <span className="text-sm text-green-600">• Online</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
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
