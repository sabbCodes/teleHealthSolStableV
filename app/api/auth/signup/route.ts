import { type NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerComponentClient()

    // Validation
    const requiredFields = ["firstName", "lastName", "email", "password", "phone", "country"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: false, // Require email confirmation
      user_metadata: {
        first_name: body.firstName,
        last_name: body.lastName,
        user_type: body.userType || "patient",
        phone: body.phone,
        country: body.country,
        wallet_address: body.walletAddress,
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Insert additional profile data
    if (data.user) {
      const profileData = {
        id: data.user.id,
        email: body.email,
        first_name: body.firstName,
        last_name: body.lastName,
        user_type: body.userType || "patient",
        phone: body.phone,
        country: body.country,
        city: body.city,
        wallet_address: body.walletAddress,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Add user type specific data
      if (body.userType === "doctor") {
        Object.assign(profileData, {
          specialty: body.specialty,
          license_number: body.licenseNumber,
          years_of_experience: body.yearsOfExperience,
          education: body.education,
          hospital_affiliation: body.hospitalAffiliation,
          bio: body.bio,
          consultation_fee: body.consultationFee,
          languages: body.languages,
          availability: body.availability,
        })
      } else {
        Object.assign(profileData, {
          date_of_birth: body.dateOfBirth,
          gender: body.gender,
          emergency_contact: body.emergencyContact,
          medical_history: body.medicalHistory,
          allergies: body.allergies,
          current_medications: body.currentMedications,
        })
      }

      const { error: profileError } = await supabase
        .from(body.userType === "doctor" ? "doctor_profiles" : "patient_profiles")
        .insert(profileData)

      if (profileError) {
        console.error("Profile creation error:", profileError)
        // Don't fail the request if profile creation fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
      user: {
        id: data.user?.id,
        email: body.email,
        emailConfirmed: false,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
