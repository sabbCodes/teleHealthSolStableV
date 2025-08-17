"use client";

import type React from "react";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  User,
  Stethoscope,
  FileText,
  Upload,
  CheckCircle,
  Heart,
  Globe,
  Shield,
  AlertCircle,
  Wallet,
  Copy,
  Check,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Image from "next/image";

export default function DoctorOnboardingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const email = searchParams.get("email") || "";
  const walletAddress = searchParams.get("wallet") || "";
  const publicKey = searchParams.get("publicKey") || "";

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: email,
    walletAddress: walletAddress,

    phone: "",
    country: "",
    city: "",
    specialty: "",
    licenseNumber: "",
    yearsOfExperience: "",
    education: "",
    hospitalAffiliation: "",
    bio: "",
    consultationFee: "",
    languages: [] as string[],
    availability: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    profileImage: null as File | null,
    medicalLicense: null as File | null,
    medicalDegree: null as File | null,
  });

  const totalSteps = 5;

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.firstName.trim())
        newErrors.firstName = "First name is required";
      if (!formData.lastName.trim())
        newErrors.lastName = "Last name is required";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      if (!formData.country) newErrors.country = "Country is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
    }

    if (currentStep === 2) {
      if (!formData.specialty) newErrors.specialty = "Specialty is required";
      if (!formData.licenseNumber.trim())
        newErrors.licenseNumber = "License number is required";
      if (!formData.yearsOfExperience)
        newErrors.yearsOfExperience = "Years of experience is required";
      if (!formData.education.trim())
        newErrors.education = "Education is required";
    }

    if (currentStep === 3) {
      if (!formData.bio.trim()) newErrors.bio = "Professional bio is required";
      if (formData.bio.trim().length < 50)
        newErrors.bio = "Bio must be at least 50 characters";
      if (!formData.consultationFee)
        newErrors.consultationFee = "Consultation fee is required";
      if (formData.languages.length === 0)
        newErrors.languages = "At least one language is required";
    }

    if (currentStep === 4) {
      if (!formData.profileImage)
        newErrors.profileImage = "Profile image is required";
    }

    if (currentStep === 5) {
      if (!agreedToPolicy)
        newErrors.policy = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateFormData("profileImage", file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      updateFormData(fieldName, file);
    }
  };

  const copyWalletAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    } catch (err) {
      console.error("Failed to copy wallet address");
    }
  };

  const nextStep = () => {
    if (validateStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    try {
      // Create doctor profile
      const userData = {
        email: formData.email,
        walletAddress: formData.walletAddress,
        userType: "doctor",
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        dateOfBirth: "", // Add if needed
        gender: "", // Add if needed
        specialization: formData.specialty,
        licenseNumber: formData.licenseNumber,
        yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
        education: formData.education,
        certifications: [], // Add if needed
        languages: formData.languages,
        consultationFee: parseFloat(formData.consultationFee) || 0,
        bio: formData.bio,
        availabilitySchedule: formData.availability,
        profileImage: formData.profileImage,
      };

      console.log("Creating doctor profile:", userData);

      // Call Supabase API to create/update user profile
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create profile");
      }

      // Show success message
      toast({
        title: "Profile Created Successfully!",
        description:
          "Your doctor profile has been created. You can now sign in to access your account.",
      });

      // Store email for dashboard access
      localStorage.setItem("userEmail", email);

      // Redirect to signin page after a short delay
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (error: unknown) {
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Profile creation failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const countries = [
    "Nigeria",
    "Ghana",
    "Kenya",
    "South Africa",
    "Egypt",
    "Morocco",
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
  ];

  const specialties = [
    "General Practice",
    "Cardiology",
    "Dermatology",
    "Pediatrics",
    "Gynecology",
    "Psychiatry",
    "Orthopedics",
    "Neurology",
    "Oncology",
    "Endocrinology",
    "Gastroenterology",
    "Pulmonology",
  ];

  const languages = [
    "English",
    "French",
    "Arabic",
    "Spanish",
    "Portuguese",
    "Swahili",
    "Hausa",
    "Yoruba",
    "Igbo",
    "Amharic",
  ];

  const getFieldError = (field: string) => {
    return errors[field] ? (
      <p className="text-sm text-red-600 mt-1">{errors[field]}</p>
    ) : null;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Personal Information
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Let's start with your basic details
              </p>
            </div>

            {/* Wallet Information */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Wallet className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Your Wallet
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Wallet Address
                      </p>
                      <p className="font-mono text-sm text-gray-900 dark:text-white truncate">
                        {walletAddress}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyWalletAddress}
                      className="ml-2 flex-shrink-0"
                    >
                      {copiedWallet ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateFormData("firstName", e.target.value)}
                  placeholder="Enter your first name"
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {getFieldError("firstName")}
              </div>
              <div>
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateFormData("lastName", e.target.value)}
                  placeholder="Enter your last name"
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {getFieldError("lastName")}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-gray-50 dark:bg-gray-700"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  placeholder="+234 xxx xxx xxxx"
                  className={errors.phone ? "border-red-500" : ""}
                />
                {getFieldError("phone")}
              </div>
              <div>
                <Label htmlFor="country">
                  Country <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => updateFormData("country", value)}
                >
                  <SelectTrigger
                    className={errors.country ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError("country")}
              </div>
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => updateFormData("city", e.target.value)}
                placeholder="Enter your city"
                className={errors.city ? "border-red-500" : ""}
              />
              {getFieldError("city")}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Profile Picture
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Add a professional photo for your medical profile
              </p>
            </div>

            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {profileImage ? (
                    <img
                      src={profileImage || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <label
                  htmlFor="profileImage"
                  className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  <Camera className="w-5 h-5 text-white" />
                  <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  Upload a professional headshot
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This will be visible to patients. Supported formats: JPG, PNG
                  (max 5MB)
                </p>
              </div>

              {!profileImage && (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center w-full max-w-md">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <label htmlFor="profileImageDrop" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      Click to upload
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {" "}
                      or drag and drop
                    </span>
                    <input
                      id="profileImageDrop"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Professional Information
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Tell us about your medical expertise
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="specialty">
                  Medical Specialty <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.specialty}
                  onValueChange={(value) => updateFormData("specialty", value)}
                >
                  <SelectTrigger
                    className={errors.specialty ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select your specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError("specialty")}
              </div>
              <div>
                <Label htmlFor="yearsOfExperience">
                  Years of Experience <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={(e) =>
                    updateFormData("yearsOfExperience", e.target.value)
                  }
                  placeholder="e.g., 10"
                  className={errors.yearsOfExperience ? "border-red-500" : ""}
                />
                {getFieldError("yearsOfExperience")}
              </div>
            </div>

            <div>
              <Label htmlFor="licenseNumber">
                Medical License Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="licenseNumber"
                value={formData.licenseNumber}
                onChange={(e) =>
                  updateFormData("licenseNumber", e.target.value)
                }
                placeholder="Enter your medical license number"
                className={errors.licenseNumber ? "border-red-500" : ""}
              />
              {getFieldError("licenseNumber")}
            </div>

            <div>
              <Label htmlFor="education">Education & Qualifications</Label>
              <Textarea
                id="education"
                value={formData.education}
                onChange={(e) => updateFormData("education", e.target.value)}
                placeholder="List your medical degree, residency, fellowships, and certifications"
                className="min-h-[100px]"
                className={errors.education ? "border-red-500" : ""}
              />
              {getFieldError("education")}
            </div>

            <div>
              <Label htmlFor="hospitalAffiliation">
                Hospital/Clinic Affiliation
              </Label>
              <Input
                id="hospitalAffiliation"
                value={formData.hospitalAffiliation}
                onChange={(e) =>
                  updateFormData("hospitalAffiliation", e.target.value)
                }
                placeholder="Current hospital or clinic affiliation"
              />
            </div>

            <div>
              <Label htmlFor="consultationFee">
                Consultation Fee (USDC) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="consultationFee"
                type="number"
                step="0.01"
                value={formData.consultationFee}
                onChange={(e) =>
                  updateFormData("consultationFee", e.target.value)
                }
                placeholder="e.g., 25.00"
                className={errors.consultationFee ? "border-red-500" : ""}
              />
              {getFieldError("consultationFee")}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Profile & Availability
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Complete your professional profile
              </p>
            </div>

            <div>
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => updateFormData("bio", e.target.value)}
                placeholder="Write a brief description about yourself, your approach to medicine, and what patients can expect"
                className="min-h-[120px]"
                className={errors.bio ? "border-red-500" : ""}
              />
              {getFieldError("bio")}
            </div>

            <div>
              <Label>Languages Spoken</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {languages.map((language) => (
                  <div key={language} className="flex items-center space-x-2">
                    <Checkbox
                      id={language}
                      checked={formData.languages.includes(language)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFormData("languages", [
                            ...formData.languages,
                            language,
                          ]);
                        } else {
                          updateFormData(
                            "languages",
                            formData.languages.filter((l) => l !== language)
                          );
                        }
                      }}
                    />
                    <Label htmlFor={language} className="text-sm">
                      {language}
                    </Label>
                  </div>
                ))}
              </div>
              {getFieldError("languages")}
            </div>

            <div>
              <Label>Weekly Availability</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {Object.keys(formData.availability).map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={
                        formData.availability[
                          day as keyof typeof formData.availability
                        ]
                      }
                      onCheckedChange={(checked) => {
                        updateFormData("availability", {
                          ...formData.availability,
                          [day]: checked,
                        });
                      }}
                    />
                    <Label htmlFor={day} className="text-sm capitalize">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Document Verification
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Upload required documents for verification
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Medical License
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Upload a clear photo of your medical license
                </p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, "medicalLicense")}
                  className="hidden"
                  id="medicalLicense"
                />
                <label htmlFor="medicalLicense">
                  <Button variant="outline" asChild>
                    <span className="cursor-pointer">
                      {formData.medicalLicense
                        ? "File Selected"
                        : "Choose File"}
                    </span>
                  </Button>
                </label>
                {formData.medicalLicense && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {formData.medicalLicense.name}
                  </p>
                )}
              </div>

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Medical Degree
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Upload your medical degree certificate
                </p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e, "medicalDegree")}
                  className="hidden"
                  id="medicalDegree"
                />
                <label htmlFor="medicalDegree">
                  <Button variant="outline" asChild>
                    <span className="cursor-pointer">
                      {formData.medicalDegree ? "File Selected" : "Choose File"}
                    </span>
                  </Button>
                </label>
                {formData.medicalDegree && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {formData.medicalDegree.name}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-300">
                    Verification Process
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    Your documents will be reviewed by our medical board within
                    24-48 hours. You'll receive an email notification once
                    verified.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToPolicy}
                onCheckedChange={(checked) =>
                  setAgreedToPolicy(checked as boolean)
                }
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>
                ,{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
                , and{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Medical Professional Guidelines
                </a>
              </Label>
            </div>
            {errors.policy && (
              <p className="text-sm text-red-600 mt-1">{errors.policy}</p>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/telehealthlogowithtext.svg"
                alt="teleHealthSol"
                width={150}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Doctor Registration
            </span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Form Content */}
        <Card>
          <CardContent className="p-8">
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2"
              >
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700 dark:text-red-400">
                  {errors.submit}
                </span>
              </motion.div>
            )}

            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep === totalSteps ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Complete Registration
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white flex items-center"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
