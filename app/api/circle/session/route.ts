import { NextRequest, NextResponse } from "next/server";
import { circleUserSdk } from "@/lib/circle-user-sdk";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // 1. Try to create the user with EMAIL_OTP authMode
    try {
      console.log("[Circle] Creating user in /api/circle/session/route.ts", {
        userId,
        authMode: "EMAIL_OTP",
      });
      const createUserRes = await fetch("https://api.circle.com/v1/w3s/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
        },
        body: JSON.stringify({ userId, authMode: "EMAIL_OTP" }),
      });

      // If user creation fails for any reason other than "already exists" (409), throw an error.
      if (!createUserRes.ok && createUserRes.status !== 409) {
        const errorBody = await createUserRes.json().catch(() => ({}));
        throw new Error(
          `User creation failed: ${errorBody.message || "Unknown error"}`
        );
      }
    } catch (e) {
      // Log and re-throw unexpected errors during user creation.
      console.error("Critical error during Circle user creation:", e);
      throw e;
    }

    // 2. Now that the user is guaranteed to exist with the correct auth mode, create the user token.
    const { data } = await circleUserSdk.createUserToken({ userId });

    if (!data?.userToken || !data?.encryptionKey) {
      return NextResponse.json(
        { error: "Failed to create user token" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      userToken: data.userToken,
      encryptionKey: data.encryptionKey,
    });
  } catch (error: any) {
    // Catch-all for any other errors in the process.
    const errorResponse =
      error.response?.data || error.message || "Internal server error";
    console.error("Error in create session route:", errorResponse);
    return NextResponse.json(
      { error: "Internal server error", details: errorResponse },
      { status: 500 }
    );
  }
}
