"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSearchParams, useRouter } from "next/navigation"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function DoctorOnboardingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get("email") || ""
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: email,
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
  })

  const totalSteps = 4

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
      if (!formData.country) newErrors.country = "Country is required"
    }

    if (currentStep === 2) {
      if (!formData.specialty) newErrors.specialty = "Specialty is required"
      if (!formData.licenseNumber.trim()) newErrors.licenseNumber = "License number is required"
      if (!formData.yearsOfExperience) newErrors.yearsOfExperience = "Years of experience is required"
      if (!formData.consultationFee) newErrors.consultationFee = "Consultation fee is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const nextStep = () => {
    if (validateStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      setErrors({})
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep()) return

    setIsSubmitting(true)
    try {
      // Create doctor profile
      const userData = {
        email: formData.email,
        userType: "doctor",
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        specialty: formData.specialty,
        licenseNumber: formData.licenseNumber,
        yearsOfExperience: formData.yearsOfExperience,
        education: formData.education,
        hospitalAffiliation: formData.hospitalAffiliation,
        bio: formData.bio,
        consultationFee: formData.consultationFee,
        languages: formData.languages,
        availability: formData.availability,
      }

      console.log("Creating doctor profile:", userData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirect to doctor dashboard
      router.push("/doctor-dashboard")
    } catch (error: any) {
      setErrors({ submit: error.message || "Profile creation failed. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

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
  ]

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
  ]

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
  ]

  const getFieldError = (field: string) => {
    return errors[field] ? <p className="text-sm text-red-600 mt-1">{errors[field]}</p> : null
  }

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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Personal Information</h2>
              <p className="text-gray-600 dark:text-gray-300">Let's start with your basic details</p>
            </div>

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
              <Input id="email" type="email" value={formData.email} disabled className="bg-gray-50 dark:bg-gray-700" />
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
                <Select value={formData.country} onValueChange={(value) => updateFormData("country", value)}>
                  <SelectTrigger className={errors.country ? "border-red-500" : ""}>
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
          </motion.div>
        )

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
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Professional Information</h2>
              <p className="text-gray-600 dark:text-gray-300">Tell us about your medical expertise</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="specialty">
                  Medical Specialty <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.specialty} onValueChange={(value) => updateFormData("specialty", value)}>
                  <SelectTrigger className={errors.specialty ? "border-red-500" : ""}>
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
                  onChange={(e) => updateFormData("yearsOfExperience", e.target.value)}
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
                onChange={(e) => updateFormData("licenseNumber", e.target.value)}
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
              />
            </div>

            <div>
              <Label htmlFor="hospitalAffiliation">Hospital/Clinic Affiliation</Label>
              <Input
                id="hospitalAffiliation"
                value={formData.hospitalAffiliation}
                onChange={(e) => updateFormData("hospitalAffiliation", e.target.value)}
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
                onChange={(e) => updateFormData("consultationFee", e.target.value)}
                placeholder="e.g., 25.00"
                className={errors.consultationFee ? "border-red-500" : ""}
              />
              {getFieldError("consultationFee")}
            </div>
          </motion.div>
        )

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
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile & Availability</h2>
              <p className="text-gray-600 dark:text-gray-300">Complete your professional profile</p>
            </div>

            <div>
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => updateFormData("bio", e.target.value)}
                placeholder="Write a brief description about yourself, your approach to medicine, and what patients can expect"
                className="min-h-[120px]"
              />
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
                          updateFormData("languages", [...formData.languages, language])
                        } else {
                          updateFormData(
                            "languages",
                            formData.languages.filter((l) => l !== language),
                          )
                        }
                      }}
                    />
                    <Label htmlFor={language} className="text-sm">
                      {language}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Weekly Availability</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {Object.keys(formData.availability).map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={formData.availability[day as keyof typeof formData.availability]}
                      onCheckedChange={(checked) => {
                        updateFormData("availability", {
                          ...formData.availability,
                          [day]: checked,
                        })
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
        )

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
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Document Verification</h2>
              <p className="text-gray-600 dark:text-gray-300">Upload required documents for verification</p>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Medical License</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Upload a clear photo of your medical license
                </p>
                <Button variant="outline">Choose File</Button>
              </div>

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Medical Degree</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Upload your medical degree certificate</p>
                <Button variant="outline">Choose File</Button>
              </div>

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Professional Photo</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Upload a professional headshot for your profile
                </p>
                <Button variant="outline">Choose File</Button>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-300">Verification Process</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    Your documents will be reviewed by our medical board within 24-48 hours. You'll receive an email
                    notification once verified.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
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
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">teleHealthSol</span>
          </div>
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Doctor Registration</span>
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
                <span className="text-sm text-red-700 dark:text-red-400">{errors.submit}</span>
              </motion.div>
            )}

            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="flex items-center">
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
  )
}
