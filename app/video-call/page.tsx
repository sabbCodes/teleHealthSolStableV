"use client"

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
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
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useToast } from "@/hooks/use-toast";

export default function VideoCallPage() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams?.get("appointmentId") || "";
  const roleParam = (searchParams?.get("role") as "doctor" | "patient") || "patient";

  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isCallActiveOverlay, setIsCallActiveOverlay] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [showChat, setShowChat] = useState(false);

  const localVideoRefLg = useRef<HTMLVideoElement | null>(null);
  const localVideoRefSm = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const { toast } = useToast();

  const {
    localStream,
    remoteStream,
    // isConnected,
    connectionStatus,
    isCallActive,
    toggleAudio,
    toggleVideo,
    endCall: endCallHook,
    error,
  } = useWebRTC(roleParam, appointmentId);

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
    endCallHook();
    setIsCallActiveOverlay(false)

    const redirectPath = roleParam === 'doctor' ? '/doctor-dashboard' : '/dashboard';

    setTimeout(() => {
      window.location.href = redirectPath;
    }, 1000)
  }

  // Attach streams to video elements
  useEffect(() => {
    if (localStream) {
      try {
        if (localVideoRefLg.current) {
          localVideoRefLg.current.srcObject = localStream;
          localVideoRefLg.current.muted = true;
          void localVideoRefLg.current.play().catch(() => {});
        }
        if (localVideoRefSm.current) {
          localVideoRefSm.current.srcObject = localStream;
          localVideoRefSm.current.muted = true;
          void localVideoRefSm.current.play().catch(() => {});
        }
      } catch {}
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      try {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.muted = false;
        void remoteVideoRef.current.play().catch(() => {});
      } catch {}
    }
  }, [remoteStream]);

  // Surface errors as toasts instead of in-page banner
  useEffect(() => {
    if (error) {
      toast({ title: "Call error", description: String(error) });
    }
  }, [error, toast]);

  // Optional: notify on connect/disconnect
  useEffect(() => {
    if (connectionStatus === "connected") {
      toast({ title: "Connected", description: "You are now connected." });
    } else if (connectionStatus === "error") {
      toast({ title: "Connection issue", description: "There was a problem with the call." });
    }
  }, [connectionStatus, toast]);

  const statusColor =
    connectionStatus === 'connected'
      ? 'bg-green-500'
      : connectionStatus === 'connecting'
      ? 'bg-yellow-500'
      : connectionStatus === 'error'
      ? 'bg-red-500'
      : 'bg-gray-400';

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background Video Areas */}
      <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        {/* Remote Participant Video */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-gray-800 rounded-xl overflow-hidden h-[85vh] lg:h-[80vh]"
        >
          <video
            ref={remoteVideoRef}
            className="absolute inset-0 w-full h-full object-cover bg-black z-0"
            autoPlay
            playsInline
          />

          {/* Participant Info Overlay */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
              <h3 className="text-white font-semibold">{roleParam === 'doctor' ? 'Patient' : 'Doctor'}</h3>
              <p className="text-gray-300 text-sm">{roleParam === 'doctor' ? 'Participant' : 'Consultant'}</p>
              <Badge className="mt-1 bg-green-600">{connectionStatus}</Badge>
            </div>
          </div>

          {/* Call Duration */}
          <div className="absolute top-4 right-4 z-10 pointer-events-none">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-white" />
              <span className="text-white font-mono">{formatTime(callDuration)}</span>
            </div>
          </div>
        </motion.div>

        {/* Local Self Video */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative bg-gray-800 rounded-xl overflow-hidden lg:block hidden h-[40vh] lg:h-[80vh]"
        >
          <video
            ref={localVideoRefLg}
            className="absolute inset-0 w-full h-full object-cover bg-black z-0"
            autoPlay
            playsInline
            muted
          />

          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
              <span className="text-white text-sm">You ({roleParam})</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile Self Video (Picture-in-Picture) */}
      <div className="lg:hidden absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden z-10">
        <video
          ref={localVideoRefSm}
          className="w-full h-full object-cover bg-black"
          autoPlay
          playsInline
          muted
        />
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
                  onClick={() => {
                    toggleAudio();
                    setIsAudioOn(!isAudioOn);
                  }}
                  disabled={connectionStatus !== "connected" && connectionStatus !== "connecting"}
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
                  onClick={() => {
                    toggleVideo();
                    setIsVideoOn(!isVideoOn);
                  }}
                  disabled={connectionStatus !== "connected" && connectionStatus !== "connecting"}
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
          <div className={`w-2 h-2 rounded-full animate-pulse ${statusColor}`} />
          <span className="text-white text-sm capitalize">{connectionStatus}</span>
          <span className="text-white/70 text-xs ml-2">Appt: {appointmentId || "(missing)"}</span>
          <span className="text-white/70 text-xs ml-2">Role: {roleParam}</span>
        </div>
      </div>

      {/* Call End Animation */}
      {!isCallActiveOverlay && (
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
              <p className="text-sm">Redirecting to {roleParam === "doctor" ? "your dashboard" : "payment release page"}...</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
