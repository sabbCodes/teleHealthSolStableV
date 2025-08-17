import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Get user profile
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (userError) {
      console.error("Error fetching user profile:", userError);
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    let detailedProfile = null;

    // Get detailed profile based on user type
    if (userProfile.user_type === "patient") {
      const { data: patientProfile } = await supabase
        .from("patient_profiles")
        .select("*")
        .eq("user_profile_id", userProfile.id)
        .single();
      detailedProfile = patientProfile;
    } else if (userProfile.user_type === "doctor") {
      const { data: doctorProfile } = await supabase
        .from("doctor_profiles")
        .select("*")
        .eq("user_profile_id", userProfile.id)
        .single();
      detailedProfile = doctorProfile;
    } else if (userProfile.user_type === "pharmacy") {
      const { data: pharmacyProfile } = await supabase
        .from("pharmacy_profiles")
        .select("*")
        .eq("user_profile_id", userProfile.id)
        .single();
      detailedProfile = pharmacyProfile;
    } else if (userProfile.user_type === "admin") {
      const { data: adminProfile } = await supabase
        .from("admin_profiles")
        .select("*")
        .eq("user_profile_id", userProfile.id)
        .single();
      detailedProfile = adminProfile;
    }

    return NextResponse.json({
      success: true,
      user: {
        ...userProfile,
        detailedProfile,
      },
    });
  } catch (error) {
    console.error("Get profile API error:", error);
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
