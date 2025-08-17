"use client";

import type React from "react";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Pill,
  Building,
  Mail,
  CheckCircle,
  Shield,
  Clock,
  AlertCircle,
  Wallet,
  Copy,
  Check,
  Camera,
  Upload,
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
import { Switch } from "@/components/ui/switch";
import { AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Image from "next/image";

export default function PharmacyOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  const [pharmacyImages, setPharmacyImages] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const email = searchParams.get("email") || "";
  const walletAddress = searchParams.get("wallet") || "";
  const publicKeyParam = searchParams.get("publicKey") || "";

  const [formData, setFormData] = useState({
    // Pharmacy Information
    pharmacyName: "",
    email: email,
    walletAddress: walletAddress,

    phone: "",
    country: "",
    city: "",
    address: "",
    licenseNumber: "",
    registrationNumber: "",
    yearEstablished: "",
    website: "",
    description: "",

    // Operational Details
    operatingHours: {
      monday: { open: "09:00", close: "18:00", isOpen: true },
      tuesday: { open: "09:00", close: "18:00", isOpen: true },
      wednesday: { open: "09:00", close: "18:00", isOpen: true },
      thursday: { open: "09:00", close: "18:00", isOpen: true },
      friday: { open: "09:00", close: "18:00", isOpen: true },
      saturday: { open: "09:00", close: "14:00", isOpen: true },
      sunday: { open: "00:00", close: "00:00", isOpen: false },
    },
    deliveryRadius: "5",
    deliveryFee: "2.50",
    minimumOrderValue: "10.00",
    acceptsInsurance: false,
    insuranceProviders: [] as string[],

    // Services
    services: {
      prescription: true,
      otc: true,
      homeDelivery: true,
      consultation: false,
      vaccination: false,
      healthScreening: false,
    },

    // Payment Methods
    paymentMethods: {
      crypto: true,
      creditCard: true,
      bankTransfer: false,
      mobileMoney: false,
    },

    // Files
    pharmacyImages: [] as File[],
    pharmacyLicense: null as File | null,
    businessRegistration: null as File | null,
    profileImage: null as File | null,
  });

  const totalSteps = 5;

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.pharmacyName.trim())
        newErrors.pharmacyName = "Pharmacy name is required";
      if (!formData.contactPersonFirstName.trim())
        newErrors.contactPersonFirstName =
          "Contact person first name is required";
      if (!formData.contactPersonLastName.trim())
        newErrors.contactPersonLastName =
          "Contact person last name is required";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      if (!formData.country) newErrors.country = "Country is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.address.trim()) newErrors.address = "Address is required";
    }

    if (currentStep === 2) {
      if (!formData.licenseNumber.trim())
        newErrors.licenseNumber = "License number is required";
      if (!formData.registrationNumber.trim())
        newErrors.registrationNumber = "Registration number is required";
      if (!formData.yearEstablished)
        newErrors.yearEstablished = "Year established is required";
    }

    if (currentStep === 3) {
      if (!formData.description.trim())
        newErrors.description = "Description is required";
      if (formData.description.trim().length < 30)
        newErrors.description = "Description must be at least 30 characters";
      if (formData.servicesOffered.length === 0)
        newErrors.servicesOffered = "At least one service is required";
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
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const updateNestedFormData = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const updateOperatingHours = (day: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day as keyof typeof prev.operatingHours],
          [field]: value,
        },
      },
    }));
  };

  const handlePharmacyImagesUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      updateFormData("profileImage", file);

      // Create preview URL
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
      // Create pharmacy profile
      const userData = {
        email: formData.email,
        walletAddress: formData.walletAddress,
        userType: "pharmacy",
        pharmacyName: formData.pharmacyName,
        contactPersonFirstName: formData.contactPersonFirstName,
        contactPersonLastName: formData.contactPersonLastName,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        licenseNumber: formData.licenseNumber,
        operatingHours: formData.operatingHours,
        servicesOffered: formData.servicesOffered,
        deliveryRadiusKm: formData.deliveryRadiusKm || 10,
        deliveryFee: formData.deliveryFee || 0,
        description: formData.description,
        certifications: [], // Add if needed
        profileImage: formData.profileImage || null, // Use first image as profile
      };

      console.log("Creating pharmacy profile:", userData);

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
          "Your pharmacy profile has been created. You can now sign in to access your account.",
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

  const insuranceProviders = [
    "National Health Insurance",
    "Blue Cross",
    "Aetna",
    "Cigna",
    "UnitedHealthcare",
    "Kaiser Permanente",
    "Humana",
    "Medicare",
    "Medicaid",
  ];

  const getFieldError = (field: string) => {
    return errors[field] ? (
      <p className="text-sm text-red-600 mt-1">{errors[field]}</p>
    ) : null;
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
            <Pill className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Pharmacy Registration
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

            <AnimatePresence mode="wait">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Building className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Pharmacy Information
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Let's start with your pharmacy's basic details
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

                  <div>
                    <Label htmlFor="pharmacyName">
                      Pharmacy Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="pharmacyName"
                      value={formData.pharmacyName}
                      onChange={(e) =>
                        updateFormData("pharmacyName", e.target.value)
                      }
                      placeholder="Enter your pharmacy name"
                      className={errors.pharmacyName ? "border-red-500" : ""}
                    />
                    {getFieldError("pharmacyName")}
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
                        onChange={(e) =>
                          updateFormData("phone", e.target.value)
                        }
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
                        onValueChange={(value) =>
                          updateFormData("country", value)
                        }
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

                  <div className="grid md:grid-cols-2 gap-4">
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
                    <div>
                      <Label htmlFor="yearEstablished">Year Established</Label>
                      <Input
                        id="yearEstablished"
                        type="number"
                        value={formData.yearEstablished}
                        onChange={(e) =>
                          updateFormData("yearEstablished", e.target.value)
                        }
                        placeholder="e.g., 2010"
                        className={
                          errors.yearEstablished ? "border-red-500" : ""
                        }
                      />
                      {getFieldError("yearEstablished")}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) =>
                        updateFormData("website", e.target.value)
                      }
                      placeholder="https://yourpharmacy.com"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Pharmacy Images */}
              {currentStep === 2 && (
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
                      Pharmacy Photos
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Add photos of your pharmacy to build trust with customers
                    </p>
                  </div>

                  <div className="space-y-4">
                    {profileImage && (
                      <div className="flex justify-center">
                        <div className="relative">
                          <img
                            src={profileImage}
                            alt="Pharmacy Profile"
                            className="w-48 h-48 object-cover rounded-lg border"
                          />
                        </div>
                      </div>
                    )}

                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        Upload Pharmacy Profile Photo
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Add a professional photo of your pharmacy
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePharmacyImagesUpload}
                        className="hidden"
                        id="pharmacyImages"
                      />
                      <label htmlFor="pharmacyImages">
                        <Button variant="outline" asChild>
                          <span className="cursor-pointer">Choose Photo</span>
                        </Button>
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Supported formats: JPG, PNG (max 5MB)
                      </p>
                    </div>
                    {errors.profileImage && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.profileImage}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Legal & Location */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Legal & Location
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Provide your licensing and location details
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="address">
                      Full Address <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        updateFormData("address", e.target.value)
                      }
                      placeholder="Enter your complete pharmacy address"
                      className={errors.address ? "border-red-500" : ""}
                    />
                    {getFieldError("address")}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="licenseNumber">
                        Pharmacy License Number{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={(e) =>
                          updateFormData("licenseNumber", e.target.value)
                        }
                        placeholder="Enter license number"
                        className={errors.licenseNumber ? "border-red-500" : ""}
                      />
                      {getFieldError("licenseNumber")}
                    </div>
                    <div>
                      <Label htmlFor="registrationNumber">
                        Business Registration Number
                      </Label>
                      <Input
                        id="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={(e) =>
                          updateFormData("registrationNumber", e.target.value)
                        }
                        placeholder="Enter registration number"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Pharmacy Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        updateFormData("description", e.target.value)
                      }
                      placeholder="Describe your pharmacy, specialties, and what makes you unique"
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        Pharmacy License
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Upload a clear photo of your pharmacy license
                      </p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(e, "pharmacyLicense")}
                        className="hidden"
                        id="pharmacyLicense"
                      />
                      <label htmlFor="pharmacyLicense">
                        <Button variant="outline" asChild>
                          <span className="cursor-pointer">
                            {formData.pharmacyLicense
                              ? "File Selected"
                              : "Choose File"}
                          </span>
                        </Button>
                      </label>
                      {formData.pharmacyLicense && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ {formData.pharmacyLicense.name}
                        </p>
                      )}
                    </div>

                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        Business Registration
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Upload your business registration certificate
                      </p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) =>
                          handleFileUpload(e, "businessRegistration")
                        }
                        className="hidden"
                        id="businessRegistration"
                      />
                      <label htmlFor="businessRegistration">
                        <Button variant="outline" asChild>
                          <span className="cursor-pointer">
                            {formData.businessRegistration
                              ? "File Selected"
                              : "Choose File"}
                          </span>
                        </Button>
                      </label>
                      {formData.businessRegistration && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ {formData.businessRegistration.name}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Services & Operations */}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Services & Operations
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Configure your services and operating hours
                    </p>
                  </div>

                  <div>
                    <Label className="text-base font-medium">
                      Services Offered
                    </Label>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      {Object.entries(formData.services).map(
                        ([service, enabled]) => (
                          <div
                            key={service}
                            className="flex items-center space-x-2"
                          >
                            <Switch
                              id={service}
                              checked={enabled}
                              onCheckedChange={(checked) =>
                                updateNestedFormData(
                                  "services",
                                  service,
                                  checked
                                )
                              }
                            />
                            <Label htmlFor={service} className="capitalize">
                              {service.replace(/([A-Z])/g, " $1").trim()}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="deliveryRadius">
                        Delivery Radius (km)
                      </Label>
                      <Input
                        id="deliveryRadius"
                        type="number"
                        value={formData.deliveryRadius}
                        onChange={(e) =>
                          updateFormData("deliveryRadius", e.target.value)
                        }
                        placeholder="5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deliveryFee">Delivery Fee (USDC)</Label>
                      <Input
                        id="deliveryFee"
                        type="number"
                        step="0.01"
                        value={formData.deliveryFee}
                        onChange={(e) =>
                          updateFormData("deliveryFee", e.target.value)
                        }
                        placeholder="2.50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="minimumOrderValue">
                        Minimum Order (USDC)
                      </Label>
                      <Input
                        id="minimumOrderValue"
                        type="number"
                        step="0.01"
                        value={formData.minimumOrderValue}
                        onChange={(e) =>
                          updateFormData("minimumOrderValue", e.target.value)
                        }
                        placeholder="10.00"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium">
                      Operating Hours
                    </Label>
                    <div className="space-y-3 mt-3">
                      {Object.entries(formData.operatingHours).map(
                        ([day, hours]) => (
                          <div
                            key={day}
                            className="flex items-center space-x-4"
                          >
                            <div className="w-20">
                              <Switch
                                checked={hours.isOpen}
                                onCheckedChange={(checked) =>
                                  updateOperatingHours(day, "isOpen", checked)
                                }
                              />
                            </div>
                            <div className="w-24 capitalize font-medium">
                              {day}
                            </div>
                            {hours.isOpen ? (
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="time"
                                  value={hours.open}
                                  onChange={(e) =>
                                    updateOperatingHours(
                                      day,
                                      "open",
                                      e.target.value
                                    )
                                  }
                                  className="w-32"
                                />
                                <span>to</span>
                                <Input
                                  type="time"
                                  value={hours.close}
                                  onChange={(e) =>
                                    updateOperatingHours(
                                      day,
                                      "close",
                                      e.target.value
                                    )
                                  }
                                  className="w-32"
                                />
                              </div>
                            ) : (
                              <span className="text-gray-500">Closed</span>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Switch
                        id="acceptsInsurance"
                        checked={formData.acceptsInsurance}
                        onCheckedChange={(checked) =>
                          updateFormData("acceptsInsurance", checked)
                        }
                      />
                      <Label
                        htmlFor="acceptsInsurance"
                        className="text-base font-medium"
                      >
                        Accept Insurance
                      </Label>
                    </div>
                    {formData.acceptsInsurance && (
                      <div className="grid grid-cols-2 gap-3">
                        {insuranceProviders.map((provider) => (
                          <div
                            key={provider}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={provider}
                              checked={formData.insuranceProviders.includes(
                                provider
                              )}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateFormData("insuranceProviders", [
                                    ...formData.insuranceProviders,
                                    provider,
                                  ]);
                                } else {
                                  updateFormData(
                                    "insuranceProviders",
                                    formData.insuranceProviders.filter(
                                      (p) => p !== provider
                                    )
                                  );
                                }
                              }}
                            />
                            <Label htmlFor={provider} className="text-sm">
                              {provider}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 5: Review & Submit */}
              {currentStep === 5 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Review & Submit
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Review your information before submitting
                    </p>
                  </div>

                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          {formData.pharmacyName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {formData.email}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {formData.address}
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-300">
                            Country:
                          </span>
                          <p className="font-medium">{formData.country}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-300">
                            Phone:
                          </span>
                          <p className="font-medium">{formData.phone}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-300">
                            License:
                          </span>
                          <p className="font-medium">
                            {formData.licenseNumber}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-300">
                            Established:
                          </span>
                          <p className="font-medium">
                            {formData.yearEstablished || "Not specified"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
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

                      <div>
                        <h4 className="font-medium mb-2">Services</h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(formData.services)
                            .filter(([_, enabled]) => enabled)
                            .map(([service]) => (
                              <span
                                key={service}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full capitalize"
                              >
                                {service.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                            ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
                      What's Next?
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Email verification link will be sent
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Document review within 24-48 hours
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Access to pharmacy dashboard
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Start receiving prescription orders
                      </li>
                    </ul>
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
                        Pharmacy Guidelines
                      </a>
                    </Label>
                  </div>
                  {errors.policy && (
                    <p className="text-sm text-red-600 mt-1">{errors.policy}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

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
