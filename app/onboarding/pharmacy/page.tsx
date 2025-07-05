"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Pill,
  Building,
  Mail,
  Heart,
  CheckCircle,
  Shield,
  Clock,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
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
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

export default function PharmacyOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const wallet = searchParams.get("wallet");
  const [formData, setFormData] = useState({
    // Pharmacy Information
    pharmacyName: "",
    email: email,
    phone: "",
    country: "",
    city: "",
    address: "",
    licenseNumber: "",
    registrationNumber: "",
    yearEstablished: "",
    website: "",
    password: "",
    confirmPassword: "",

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
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const totalSteps = 4;

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    // Step 1 validation
    if (currentStep === 1) {
      if (!formData.pharmacyName.trim())
        newErrors.pharmacyName = "Pharmacy name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      if (!formData.email.includes("@"))
        newErrors.email = "Please enter a valid email";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      if (!formData.country) newErrors.country = "Country is required";
      if (!formData.password) newErrors.password = "Password is required";
      if (formData.password && formData.password.length < 8)
        newErrors.password = "Password must be at least 8 characters long";
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }

    // Step 2 validation
    if (currentStep === 2) {
      if (!formData.licenseNumber.trim())
        newErrors.licenseNumber = "License number is required";
      if (!formData.address.trim()) newErrors.address = "Address is required";
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
        ...(prev[parent as keyof typeof prev] &&
        typeof prev[parent as keyof typeof prev] === "object" &&
        !Array.isArray(prev[parent as keyof typeof prev])
          ? (prev[parent as keyof typeof prev] as object)
          : {}),
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Show email verification screen
      setEmailVerificationSent(true);
    } catch (error: any) {
      setErrors({
        submit: error.message || "Registration failed. Please try again.",
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

  // Show email verification message
  if (emailVerificationSent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Mail className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Check Your Email
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We've sent a verification link to{" "}
              <strong>{formData.email}</strong>. Please check your email and
              click the link to verify your pharmacy account.
            </p>
            <Button
              onClick={() => (window.location.href = "/")}
              className="w-full"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              teleHealthSol
            </span>
          </Link>
          <div className="flex items-center space-x-2">
            <Pill className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Pharmacy Registration
            </span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {wallet && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-300 text-sm break-all">
            <strong>Wallet Address:</strong> {wallet}
          </div>
        )}
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
                    <Label htmlFor="email">
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      placeholder="Enter your business email address"
                      className={errors.email ? "border-red-500" : ""}
                      disabled
                    />
                    {getFieldError("email")}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">
                        Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          className="pl-10 pr-10"
                          required
                          value={formData.password}
                          onChange={(e) =>
                            updateFormData("password", e.target.value)
                          }
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          tabIndex={0}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {getFieldError("password")}
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">
                        Confirm Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className="pl-10 pr-10"
                          required
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            updateFormData("confirmPassword", e.target.value)
                          }
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          tabIndex={0}
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          onClick={() => setShowConfirmPassword((v) => !v)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {getFieldError("confirmPassword")}
                    </div>
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
                        placeholder="+1 (555) 123-4567"
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

                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateFormData("city", e.target.value)}
                      placeholder="Enter your city"
                    />
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

              {/* Step 2: License & Registration */}
              {currentStep === 2 && (
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
                      License & Registration
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Verify your pharmacy's credentials
                    </p>
                  </div>

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
                      placeholder="Enter your pharmacy license number"
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
                      placeholder="Enter your business registration number"
                    />
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
                      placeholder="2020"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">
                      Pharmacy Address <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        updateFormData("address", e.target.value)
                      }
                      placeholder="Enter your complete pharmacy address"
                      className={errors.address ? "border-red-500" : ""}
                      rows={3}
                    />
                    {getFieldError("address")}
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
                        min="1"
                        max="100"
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
                        min="0"
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
                        min="0"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Services & Operations */}
              {currentStep === 3 && (
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

                  {/* Services */}
                  <div>
                    <Label className="text-base font-semibold">
                      Services Offered
                    </Label>
                    <div className="grid md:grid-cols-2 gap-4 mt-3">
                      {Object.entries(formData.services).map(
                        ([service, enabled]) => (
                          <div
                            key={service}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
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
                              {service === "otc"
                                ? "Over-the-Counter Medications"
                                : service.replace(/([A-Z])/g, " $1")}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div>
                    <Label className="text-base font-semibold">
                      Payment Methods
                    </Label>
                    <div className="grid md:grid-cols-2 gap-4 mt-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="usdc" checked={true} disabled={true} />
                        <Label
                          htmlFor="usdc"
                          className="font-medium text-green-600"
                        >
                          USDC (Required)
                        </Label>
                      </div>
                      {Object.entries(formData.paymentMethods)
                        .filter(([method]) => method !== "crypto")
                        .map(([method, enabled]) => (
                          <div
                            key={method}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={method}
                              checked={enabled}
                              onCheckedChange={(checked) =>
                                updateNestedFormData(
                                  "paymentMethods",
                                  method,
                                  checked
                                )
                              }
                            />
                            <Label htmlFor={method} className="capitalize">
                              {method === "creditCard"
                                ? "Credit/Debit Card"
                                : method.replace(/([A-Z])/g, " $1")}
                            </Label>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Insurance */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Checkbox
                        id="acceptsInsurance"
                        checked={formData.acceptsInsurance}
                        onCheckedChange={(checked) =>
                          updateFormData("acceptsInsurance", checked)
                        }
                      />
                      <Label
                        htmlFor="acceptsInsurance"
                        className="text-base font-semibold"
                      >
                        Accept Insurance
                      </Label>
                    </div>
                    {formData.acceptsInsurance && (
                      <div className="grid md:grid-cols-2 gap-4">
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

              {/* Step 4: Operating Hours */}
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
                      Operating Hours
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      Set your pharmacy's operating schedule
                    </p>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(formData.operatingHours).map(
                      ([day, hours]) => (
                        <div
                          key={day}
                          className="flex items-center space-x-4 p-4 border rounded-lg"
                        >
                          <div className="w-20">
                            <Label className="capitalize font-medium">
                              {day}
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={hours.isOpen}
                              onCheckedChange={(checked) =>
                                updateOperatingHours(day, "isOpen", checked)
                              }
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {hours.isOpen ? "Open" : "Closed"}
                            </span>
                          </div>
                          {hours.isOpen && (
                            <div className="flex items-center space-x-2 flex-1">
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
                              <span className="text-gray-500">to</span>
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
                          )}
                        </div>
                      )
                    )}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                      Review Your Information
                    </h3>
                    <div className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                      <p>
                        <strong>Pharmacy:</strong> {formData.pharmacyName}
                      </p>
                      <p>
                        <strong>Email:</strong> {formData.email}
                      </p>
                      <p>
                        <strong>Location:</strong> {formData.city},{" "}
                        {formData.country}
                      </p>
                      <p>
                        <strong>License:</strong> {formData.licenseNumber}
                      </p>
                      <p>
                        <strong>Services:</strong>{" "}
                        {Object.entries(formData.services)
                          .filter(([, enabled]) => enabled)
                          .map(([service]) => service)
                          .join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                      USDC Payments Ready
                    </h3>
                    <div className="text-sm text-green-800 dark:text-green-400 space-y-1">
                      <p>✓ Your pharmacy can now accept USDC payments</p>
                      <p>✓ Instant settlement with low fees</p>
                      <p>✓ Global accessibility for international patients</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  className="flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
