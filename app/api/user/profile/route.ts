import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const userData = await request.json();
    console.log("Received user data:", userData);

    if (!userData.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate required environment variables
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Handle profile image upload if present
    let profileImageUrl = null;
    if (userData.profileImage) {
      try {
        // Convert File to base64 for storage (in production, you'd upload to Supabase Storage)
        const base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(userData.profileImage);
        });
        profileImageUrl = base64Data;
      } catch (imageError) {
        console.error("Error processing profile image:", imageError);
        // Continue without image if there's an error
      }
    }

    // Check if user_profiles table exists by trying to select from it
    try {
      const { data: tableCheck, error: tableError } = await supabase
        .from("user_profiles")
        .select("id")
        .limit(1);

      if (tableError) {
        console.error("Table check error:", tableError);
        return NextResponse.json(
          {
            error:
              "Database table not found. Please check your Supabase setup.",
          },
          { status: 500 }
        );
      }
    } catch (tableCheckError) {
      console.error("Table existence check failed:", tableCheckError);
      return NextResponse.json(
        {
          error:
            "Database connection failed. Please check your Supabase configuration.",
        },
        { status: 500 }
      );
    }

    // First, check if user exists in auth.users by trying to get their ID
    // Since we can't directly query auth.users, we'll try to create/update the profile
    // and let the foreign key constraint handle the validation

    // Check if user profile already exists by email
    const { data: existingProfile, error: fetchError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("email", userData.email)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching user profile:", fetchError);
      return NextResponse.json(
        { error: "Failed to check user profile existence" },
        { status: 500 }
      );
    }

    let result;
    if (existingProfile) {
      console.log("Updating existing user profile:", existingProfile.id);
      // Update existing user profile
      const updateData: any = {
        user_type: userData.userType,
        updated_at: new Date().toISOString(),
      };

      if (profileImageUrl) {
        updateData.profile_image = profileImageUrl;
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .update(updateData)
        .eq("email", userData.email)
        .select()
        .single();

      if (error) {
        console.error("Error updating user profile:", error);
        return NextResponse.json(
          { error: `Failed to update user profile: ${error.message}` },
          { status: 500 }
        );
      }

      // If this is a patient, also update/create patient_profiles
      if (userData.userType === "patient") {
        const { data: existingPatientProfile } = await supabase
          .from("patient_profiles")
          .select("*")
          .eq("user_profile_id", existingProfile.id)
          .single();

        const patientData: any = {
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          country: userData.country,
          city: userData.city,
          date_of_birth: userData.dateOfBirth,
          gender: userData.gender,
          occupation: userData.occupation,
          tribe: userData.tribe,
          marital_status: userData.maritalStatus,
          address: userData.address,
          emergency_contact: userData.emergencyContact,
          emergency_contact_phone: userData.emergencyContactPhone,
          medical_history: userData.medicalHistory,
          allergies: userData.allergies,
          current_medications: userData.currentMedications,
          wallet_address: userData.walletAddress,
          updated_at: new Date().toISOString(),
        };

        if (profileImageUrl) {
          patientData.profile_image = profileImageUrl;
        }

        if (existingPatientProfile) {
          // Update existing patient profile
          const { error: patientError } = await supabase
            .from("patient_profiles")
            .update(patientData)
            .eq("user_profile_id", existingProfile.id);

          if (patientError) {
            console.error("Error updating patient profile:", patientError);
          }
        } else {
          // Create new patient profile
          const newPatientData: any = {
            user_profile_id: existingProfile.id,
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            country: userData.country,
            city: userData.city,
            date_of_birth: userData.dateOfBirth,
            gender: userData.gender,
            occupation: userData.occupation,
            tribe: userData.tribe,
            marital_status: userData.maritalStatus,
            address: userData.address,
            emergency_contact: userData.emergencyContact,
            emergency_contact_phone: userData.emergencyContactPhone,
            medical_history: userData.medicalHistory,
            allergies: userData.allergies,
            current_medications: userData.currentMedications,
            wallet_address: userData.walletAddress,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          if (profileImageUrl) {
            newPatientData.profile_image = profileImageUrl;
          }

          const { error: patientError } = await supabase
            .from("patient_profiles")
            .insert(newPatientData);

          if (patientError) {
            console.error("Error creating patient profile:", patientError);
          }
        }
      }

      // If this is a doctor, also update/create doctor_profiles
      if (userData.userType === "doctor") {
        const { data: existingDoctorProfile } = await supabase
          .from("doctor_profiles")
          .select("*")
          .eq("user_profile_id", existingProfile.id)
          .single();

        const doctorData: any = {
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          country: userData.country,
          city: userData.city,
          date_of_birth: userData.dateOfBirth,
          gender: userData.gender,
          specialization: userData.specialization,
          license_number: userData.licenseNumber,
          years_of_experience: userData.yearsOfExperience,
          education: userData.education,
          certifications: userData.certifications,
          languages: userData.languages,
          consultation_fee: userData.consultationFee,
          wallet_address: userData.walletAddress,
          bio: userData.bio,
          availability_schedule: userData.availabilitySchedule,
          updated_at: new Date().toISOString(),
        };

        if (profileImageUrl) {
          doctorData.profile_image = profileImageUrl;
        }

        if (existingDoctorProfile) {
          const { error: doctorError } = await supabase
            .from("doctor_profiles")
            .update(doctorData)
            .eq("user_profile_id", existingProfile.id);

          if (doctorError) {
            console.error("Error updating doctor profile:", doctorError);
          }
        } else {
          const newDoctorData: any = {
            user_profile_id: existingProfile.id,
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            country: userData.country,
            city: userData.city,
            date_of_birth: userData.dateOfBirth,
            gender: userData.gender,
            specialization: userData.specialization,
            license_number: userData.licenseNumber,
            years_of_experience: userData.yearsOfExperience,
            education: userData.education,
            certifications: userData.certifications,
            languages: userData.languages,
            consultation_fee: userData.consultationFee,
            wallet_address: userData.walletAddress,
            bio: userData.bio,
            availability_schedule: userData.availabilitySchedule,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          if (profileImageUrl) {
            newDoctorData.profile_image = profileImageUrl;
          }

          const { error: doctorError } = await supabase
            .from("doctor_profiles")
            .insert(newDoctorData);

          if (doctorError) {
            console.error("Error creating doctor profile:", doctorError);
          }
        }
      }

      // If this is a pharmacy, also update/create pharmacy_profiles
      if (userData.userType === "pharmacy") {
        const { data: existingPharmacyProfile } = await supabase
          .from("pharmacy_profiles")
          .select("*")
          .eq("user_profile_id", existingProfile.id)
          .single();

        const pharmacyData: any = {
          pharmacy_name: userData.pharmacyName,
          contact_person_first_name: userData.contactPersonFirstName,
          contact_person_last_name: userData.contactPersonLastName,
          phone: userData.phone,
          country: userData.country,
          city: userData.city,
          address: userData.address,
          license_number: userData.licenseNumber,
          operating_hours: userData.operatingHours,
          services_offered: userData.servicesOffered,
          delivery_radius_km: userData.deliveryRadiusKm,
          delivery_fee: userData.deliveryFee,
          wallet_address: userData.walletAddress,
          description: userData.description,
          certifications: userData.certifications,
          updated_at: new Date().toISOString(),
        };

        if (profileImageUrl) {
          pharmacyData.profile_image = profileImageUrl;
        }

        if (existingPharmacyProfile) {
          const { error: pharmacyError } = await supabase
            .from("pharmacy_profiles")
            .update(pharmacyData)
            .eq("user_profile_id", existingProfile.id);

          if (pharmacyError) {
            console.error("Error updating pharmacy profile:", pharmacyError);
          }
        } else {
          const newPharmacyData: any = {
            user_profile_id: existingProfile.id,
            pharmacy_name: userData.pharmacyName,
            contact_person_first_name: userData.contactPersonFirstName,
            contact_person_last_name: userData.contactPersonLastName,
            phone: userData.phone,
            country: userData.country,
            city: userData.city,
            address: userData.address,
            license_number: userData.licenseNumber,
            operating_hours: userData.operatingHours,
            services_offered: userData.servicesOffered,
            delivery_radius_km: userData.deliveryRadiusKm,
            delivery_fee: userData.deliveryFee,
            wallet_address: userData.walletAddress,
            description: userData.description,
            certifications: userData.certifications,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          if (profileImageUrl) {
            newPharmacyData.profile_image = profileImageUrl;
          }

          const { error: pharmacyError } = await supabase
            .from("pharmacy_profiles")
            .insert(newPharmacyData);

          if (pharmacyError) {
            console.error("Error creating pharmacy profile:", pharmacyError);
          }
        }
      }

      // If this is an admin, also update/create admin_profiles
      if (userData.userType === "admin") {
        const { data: existingAdminProfile } = await supabase
          .from("admin_profiles")
          .select("*")
          .eq("user_profile_id", existingProfile.id)
          .single();

        const adminData: any = {
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          role: userData.role || "admin",
          department: userData.department,
          wallet_address: userData.walletAddress,
          updated_at: new Date().toISOString(),
        };

        if (profileImageUrl) {
          adminData.profile_image = profileImageUrl;
        }

        if (existingAdminProfile) {
          const { error: adminError } = await supabase
            .from("admin_profiles")
            .update(adminData)
            .eq("user_profile_id", existingProfile.id);

          if (adminError) {
            console.error("Error updating admin profile:", adminError);
          }
        } else {
          const newAdminData: any = {
            user_profile_id: existingProfile.id,
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            role: userData.role || "admin",
            department: userData.department,
            wallet_address: userData.walletAddress,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          if (profileImageUrl) {
            newAdminData.profile_image = profileImageUrl;
          }

          const { error: adminError } = await supabase
            .from("admin_profiles")
            .insert(newAdminData);

          if (adminError) {
            console.error("Error creating admin profile:", adminError);
          }
        }
      }

      result = data;
    } else {
      console.log("Creating new user profile");
      // Create new user profile
      const insertData: any = {
        email: userData.email,
        user_type: userData.userType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (profileImageUrl) {
        insertData.profile_image = profileImageUrl;
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("Error creating user profile:", error);
        return NextResponse.json(
          { error: `Failed to create user profile: ${error.message}` },
          { status: 500 }
        );
      }

      // If this is a patient, also create patient_profiles
      if (userData.userType === "patient") {
        const patientData: any = {
          user_profile_id: data.id,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          country: userData.country,
          city: userData.city,
          date_of_birth: userData.dateOfBirth,
          gender: userData.gender,
          occupation: userData.occupation,
          tribe: userData.tribe,
          marital_status: userData.maritalStatus,
          address: userData.address,
          emergency_contact: userData.emergencyContact,
          emergency_contact_phone: userData.emergencyContactPhone,
          medical_history: userData.medicalHistory,
          allergies: userData.allergies,
          current_medications: userData.currentMedications,
          wallet_address: userData.walletAddress,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (profileImageUrl) {
          patientData.profile_image = profileImageUrl;
        }

        const { error: patientError } = await supabase
          .from("patient_profiles")
          .insert(patientData);

        if (patientError) {
          console.error("Error creating patient profile:", patientError);
          // Don't fail the entire request if patient profile creation fails
        }
      }

      // If this is a doctor, also create doctor_profiles
      if (userData.userType === "doctor") {
        const doctorData: any = {
          user_profile_id: data.id,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          country: userData.country,
          city: userData.city,
          date_of_birth: userData.dateOfBirth,
          gender: userData.gender,
          specialization: userData.specialization,
          license_number: userData.licenseNumber,
          years_of_experience: userData.yearsOfExperience,
          education: userData.education,
          certifications: userData.certifications,
          languages: userData.languages,
          consultation_fee: userData.consultationFee,
          wallet_address: userData.walletAddress,
          bio: userData.bio,
          availability_schedule: userData.availabilitySchedule,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (profileImageUrl) {
          doctorData.profile_image = profileImageUrl;
        }

        const { error: doctorError } = await supabase
          .from("doctor_profiles")
          .insert(doctorData);

        if (doctorError) {
          console.error("Error creating doctor profile:", doctorError);
        }
      }

      // If this is a pharmacy, also create pharmacy_profiles
      if (userData.userType === "pharmacy") {
        const pharmacyData: any = {
          user_profile_id: data.id,
          pharmacy_name: userData.pharmacyName,
          contact_person_first_name: userData.contactPersonFirstName,
          contact_person_last_name: userData.contactPersonLastName,
          phone: userData.phone,
          country: userData.country,
          city: userData.city,
          address: userData.address,
          license_number: userData.licenseNumber,
          operating_hours: userData.operatingHours,
          services_offered: userData.servicesOffered,
          delivery_radius_km: userData.deliveryRadiusKm,
          delivery_fee: userData.deliveryFee,
          wallet_address: userData.walletAddress,
          description: userData.description,
          certifications: userData.certifications,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (profileImageUrl) {
          pharmacyData.profile_image = profileImageUrl;
        }

        const { error: pharmacyError } = await supabase
          .from("pharmacy_profiles")
          .insert(pharmacyData);

        if (pharmacyError) {
          console.error("Error creating pharmacy profile:", pharmacyError);
        }
      }

      // If this is an admin, also create admin_profiles
      if (userData.userType === "admin") {
        const adminData: any = {
          user_profile_id: data.id,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          role: userData.role || "admin",
          department: userData.department,
          wallet_address: userData.walletAddress,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (profileImageUrl) {
          adminData.profile_image = profileImageUrl;
        }

        const { error: adminError } = await supabase
          .from("admin_profiles")
          .insert(adminData);

        if (adminError) {
          console.error("Error creating admin profile:", adminError);
        }
      }

      result = data;
    }

    console.log("Success:", result);
    return NextResponse.json({
      success: true,
      user: result,
      message: existingProfile
        ? "Profile updated successfully"
        : "Profile created successfully",
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      {
        error: `Internal server error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
