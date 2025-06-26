import { NextResponse } from "next/server";

export async function GET() {
  try {
    const appId = process.env.NEXT_PUBLIC_CIRCLE_APP_ID;
    
    if (!appId) {
      return NextResponse.json(
        { error: "App ID not configured" },
        { status: 500 }
      );
    }

    return NextResponse.json({ appId });
  } catch (error) {
    console.error("Error fetching config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 