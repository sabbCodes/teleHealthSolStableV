"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Settings,
  MessageCircle,
  Share,
  Clock,
  FileText,
  Camera,
  Monitor,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function VideoCallPage() {
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isCallActive, setIsCallActive] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    if (isCallActive) {
      const timer = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isCallActive])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const endCall = () => {
    setIsCallActive(false)
    // Redirect to payment/review page
    setTimeout(() => {
      window.location.href = "/payment"
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background Video Areas */}
      <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {/* Doctor's Video */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-gray-800 rounded-xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-green-600/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Avatar className="w-32 h-32">
              <AvatarImage src="/placeholder.svg?height=128&width=128" />
              <AvatarFallback className="text-2xl">AO</AvatarFallback>
            </Avatar>
          </div>

          {/* Doctor Info Overlay */}
          <div className="absolute top-4 left-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
              <h3 className="text-white font-semibold">Dr. Adaora Okafor</h3>
              <p className="text-gray-300 text-sm">Cardiologist</p>
              <Badge className="mt-1 bg-green-600">Online</Badge>
            </div>
          </div>

          {/* Call Duration */}
          <div className="absolute top-4 right-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-white" />
              <span className="text-white font-mono">{formatTime(callDuration)}</span>
            </div>
          </div>
        </motion.div>

        {/* Patient's Video (Self) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative bg-gray-800 rounded-xl overflow-hidden lg:block hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            {isVideoOn ? (
              <div className="text-white text-center">
                <Camera className="w-16 h-16 mx-auto mb-2 opacity-50" />
                <p className="opacity-75">Your video</p>
              </div>
            ) : (
              <div className="text-white text-center">
                <VideoOff className="w-16 h-16 mx-auto mb-2 opacity-50" />
                <p className="opacity-75">Video off</p>
              </div>
            )}
          </div>

          <div className="absolute top-4 left-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
              <span className="text-white text-sm">You</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile Self Video (Picture-in-Picture) */}
      <div className="lg:hidden absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden z-10">
        <div className="absolute inset-0 flex items-center justify-center">
          {isVideoOn ? (
            <Camera className="w-8 h-8 text-white opacity-50" />
          ) : (
            <VideoOff className="w-8 h-8 text-white opacity-50" />
          )}
        </div>
      </div>

      {/* Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-0 left-0 right-0 p-4"
      >
        <Card className="bg-black/50 backdrop-blur-sm border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-4">
              {/* Audio Toggle */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={isAudioOn ? "secondary" : "destructive"}
                  size="lg"
                  className="rounded-full w-12 h-12"
                  onClick={() => setIsAudioOn(!isAudioOn)}
                >
                  {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>
              </motion.div>

              {/* Video Toggle */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={isVideoOn ? "secondary" : "destructive"}
                  size="lg"
                  className="rounded-full w-12 h-12"
                  onClick={() => setIsVideoOn(!isVideoOn)}
                >
                  {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>
              </motion.div>

              {/* End Call */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="destructive"
                  size="lg"
                  className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700"
                  onClick={endCall}
                >
                  <PhoneOff className="w-6 h-6" />
                </Button>
              </motion.div>

              {/* Chat Toggle */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-full w-12 h-12"
                  onClick={() => setShowChat(!showChat)}
                >
                  <MessageCircle className="w-5 h-5" />
                </Button>
              </motion.div>

              {/* Screen Share */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="secondary" size="lg" className="rounded-full w-12 h-12">
                  <Monitor className="w-5 h-5" />
                </Button>
              </motion.div>

              {/* Settings */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="secondary" size="lg" className="rounded-full w-12 h-12">
                  <Settings className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>

            {/* Additional Controls */}
            <div className="flex items-center justify-center space-x-2 mt-4">
              <Button variant="outline" size="sm" className="bg-black/30 border-gray-600 text-white">
                <FileText className="w-4 h-4 mr-2" />
                Notes
              </Button>
              <Button variant="outline" size="sm" className="bg-black/30 border-gray-600 text-white">
                <Share className="w-4 h-4 mr-2" />
                Share Screen
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Connection Status */}
      <div className="absolute top-4 left-4">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-white text-sm">Connected</span>
        </div>
      </div>

      {/* Call End Animation */}
      {!isCallActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/80 flex items-center justify-center z-50"
        >
          <div className="text-center text-white">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.5 }}>
              <PhoneOff className="w-16 h-16 mx-auto mb-4 text-red-500" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Call Ended</h2>
            <p className="text-gray-300 mb-4">Duration: {formatTime(callDuration)}</p>
            <div className="space-y-2">
              <div className="w-8 h-1 bg-white/30 rounded mx-auto animate-pulse" />
              <p className="text-sm">Redirecting to payment...</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
