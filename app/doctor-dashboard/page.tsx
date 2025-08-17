"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  Video,
  MessageCircle,
  Star,
  TrendingUp,
  Bell,
  Settings,
  Plus,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";

export default function DoctorDashboard() {
  // const [activeTab, setActiveTab] = useState("overview")

  const stats = [
    {
      title: "Today's Appointments",
      value: "8",
      change: "+2 from yesterday",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Total Patients",
      value: "247",
      change: "+12 this week",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Monthly Earnings",
      value: "2.45 SOL",
      change: "+18% from last month",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Patient Rating",
      value: "4.9",
      change: "Based on 156 reviews",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    },
  ]

  const upcomingAppointments = [
    {
      id: 1,
      patient: "John Doe",
      time: "09:00 AM",
      type: "Video Consultation",
      condition: "Follow-up Cardiology",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "confirmed",
      duration: "30 min",
    },
    {
      id: 2,
      patient: "Sarah Johnson",
      time: "10:30 AM",
      type: "Video Consultation",
      condition: "Chest Pain Assessment",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "pending",
      duration: "45 min",
    },
    {
      id: 3,
      patient: "Michael Chen",
      time: "02:00 PM",
      type: "Video Consultation",
      condition: "Routine Checkup",
      avatar: "/placeholder.svg?height=40&width=40",
      status: "confirmed",
      duration: "30 min",
    },
  ]

  const recentPatients = [
    {
      id: 1,
      name: "Emma Wilson",
      lastVisit: "2 days ago",
      condition: "Hypertension",
      status: "Stable",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 2,
      name: "David Brown",
      lastVisit: "1 week ago",
      condition: "Diabetes Type 2",
      status: "Monitoring",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: 3,
      name: "Lisa Garcia",
      lastVisit: "3 days ago",
      condition: "Anxiety",
      status: "Improving",
      avatar: "/placeholder.svg?height=32&width=32",
    },
  ]

  const pendingTasks = [
    {
      id: 1,
      task: "Review lab results for John Doe",
      priority: "high",
      dueTime: "30 min",
    },
    {
      id: 2,
      task: "Complete medical report for Sarah Johnson",
      priority: "medium",
      dueTime: "2 hours",
    },
    {
      id: 3,
      task: "Update prescription for Michael Chen",
      priority: "low",
      dueTime: "Tomorrow",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500"
      case "medium":
        return "border-l-yellow-500"
      case "low":
        return "border-l-green-500"
      default:
        return "border-l-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src="/telehealthlogo.svg"
              alt="teleHealthSol"
              width={150}
              height={40}
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Doctor Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Welcome back, Dr. Adaora</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-5 h-5" />
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>AO</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          <Link href="/doctor-dashboard/appointments">
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white">
              <Calendar className="w-4 h-4 mr-2" />
              View Schedule
            </Button>
          </Link>
          <Link href="/chat">
            <Button variant="outline">
              <MessageCircle className="w-4 h-4 mr-2" />
              Messages
            </Button>
          </Link>
          <Link href="/doctor-dashboard/patients">
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Patient Records
            </Button>
          </Link>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Availability
          </Button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div key={index} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Appointments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Today&apos;s Appointments
                </CardTitle>
                <Link href="/doctor-dashboard/appointments">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <motion.div
                    key={appointment.id}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={appointment.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {appointment.patient
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{appointment.patient}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{appointment.condition}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {appointment.time} • {appointment.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                      <Button size="sm">
                        <Video className="w-4 h-4 mr-1" />
                        Join
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pending Tasks */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                    Pending Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 border-l-4 ${getPriorityColor(task.priority)} bg-gray-50 dark:bg-gray-700 rounded-r`}
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{task.task}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Due in {task.dueTime}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Patients */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-green-600" />
                    Recent Patients
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentPatients.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={patient.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {patient.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{patient.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">{patient.condition}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{patient.lastVisit}</p>
                        <Badge variant="outline" className="text-xs">
                          {patient.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Link href="/doctor-dashboard/patients">
                    <Button variant="ghost" size="sm" className="w-full mt-2">
                      View All Patients
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Performance */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                    This Month
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Consultations</span>
                    <span className="text-sm font-medium">42</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Avg. Rating</span>
                    <span className="text-sm font-medium">4.9 ⭐</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Response Time</span>
                    <span className="text-sm font-medium">&lt; 5 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Earnings</span>
                    <span className="text-sm font-medium">2.45 SOL</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
