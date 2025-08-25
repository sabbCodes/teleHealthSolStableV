"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  FileText,
  Video,
  Pill,
  Bell,
  Settings,
  Plus,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import { useUserProfile, getInitials } from "@/hooks/useUserProfile";

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

export default function Dashboard() {
  const { userProfile, loading, error, isAuthenticated } = useUserProfile();
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>();

  // Handle avatar image loading state
  useEffect(() => {
    if (userProfile?.profile_image) {
      // Ensure the URL is properly formatted
      const imageUrl = userProfile.profile_image.startsWith("http")
        ? userProfile.profile_image
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile_images/${userProfile.profile_image}`;

      const img = new window.Image();
      img.src = imageUrl;
      img.onload = () => setAvatarSrc(imageUrl);
      img.onerror = () => {
        console.error("Failed to load profile image:", imageUrl);
        setAvatarSrc(undefined);
      };
    } else {
      setAvatarSrc(undefined);
    }
  }, [userProfile?.profile_image]);

  // Handle redirect to sign-in if not authenticated and not loading
  useEffect(() => {
    // Only redirect if we're not loading and we're sure the user is not authenticated
    if (!loading) {
      if (isAuthenticated) {
        console.log("User is authenticated, showing dashboard");
      } else {
        console.log("User is not authenticated, will redirect to sign-in");
        const timer = setTimeout(() => {
          console.log("Executing redirect to sign-in");
          window.location.href = "/signin?redirectedFrom=dashboard";
        }, 1000);

        return () => clearTimeout(timer);
      }
    }
  }, [loading, isAuthenticated, userProfile]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    console.error("Error loading user profile:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            {userProfile ? "Profile Error" : "Authentication Error"}
          </h2>
          <p className="text-red-600 mb-4">
            {userProfile
              ? "There was an error loading your profile data."
              : "You need to be signed in to access the dashboard."}
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
            <Button
              onClick={() => (window.location.href = "/signin")}
              variant="destructive"
            >
              {userProfile ? "Update Profile" : "Sign In"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const upcomingAppointments = [
    {
      id: 1,
      doctor: "Dr. Adaora Okafor",
      specialty: "Cardiologist",
      date: "Today",
      time: "2:30 PM",
      type: "Video Call",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      doctor: "Dr. Kemi Adebayo",
      specialty: "Dermatologist",
      date: "Tomorrow",
      time: "10:00 AM",
      type: "Video Call",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ];

  const recentRecords = [
    {
      id: 1,
      title: "Blood Test Results",
      date: "2 days ago",
      doctor: "Dr. Adaora Okafor",
      type: "Lab Report",
    },
    {
      id: 2,
      title: "Consultation Notes",
      date: "1 week ago",
      doctor: "Dr. Emeka Nwosu",
      type: "Consultation",
    },
  ];

  const quickActions = [
    {
      icon: Calendar,
      label: "Book Appointment",
      href: "/doctors",
      color: "bg-blue-500",
    },
    {
      icon: Video,
      label: "Join Call",
      href: "/video-call",
      color: "bg-green-500",
    },
    {
      icon: FileText,
      label: "View Records",
      href: "/records",
      color: "bg-purple-500",
    },
    {
      icon: Pill,
      label: "Order Medication",
      href: "/medication",
      color: "bg-orange-500",
    },
  ];

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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {userProfile?.user_type ? `${userProfile.user_type.charAt(0).toUpperCase() + userProfile.user_type.slice(1)} Dashboard` : 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-5 h-5" />
            </Button>
            <Avatar>
              <AvatarImage
                src={avatarSrc}
                alt={userProfile?.full_name || "User"}
                className="object-cover"
              />
              <AvatarFallback>
                {userProfile?.full_name
                  ? getInitials(userProfile.full_name)
                  : "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {userProfile?.first_name || "User"} 👋
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Here&apos;s what&apos;s happening with your health today.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div
                      className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3`}
                    >
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {action.label}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
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
                  Upcoming Appointments
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Book New
                </Button>
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
                        <AvatarImage
                          src={appointment.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          {appointment.doctor
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {appointment.doctor}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {appointment.specialty}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {appointment.date} at {appointment.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{appointment.type}</Badge>
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

          {/* Health Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Recent Records */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Recent Records
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {record.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {record.date} • {record.doctor}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
                <Link href="/records">
                  <Button variant="ghost" size="sm" className="w-full mt-2">
                    View All Records
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Health Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Health Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Last Checkup
                  </span>
                  <span className="text-sm font-medium">2 weeks ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Medications
                  </span>
                  <span className="text-sm font-medium">3 active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Consultations
                  </span>
                  <span className="text-sm font-medium">12 total</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
