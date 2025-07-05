import { NextRequest, NextResponse } from "next/server";
import { circleUserSdk } from "@/lib/circle-user-sdk";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    console.log("[Circle] Starting wallet initialization flow...");

    // 1. Create a new user using email as userId
    const userId = email; // Use email as the user ID
    console.log("[Circle] Creating user with email as ID:", userId);

    const userResponse = await circleUserSdk.createUser({
      userId: userId,
    });

    console.log("[Circle] User created:", userResponse.data);

    // 2. Create user token
    console.log("[Circle] Creating user token...");
    const tokenResponse = await circleUserSdk.createUserToken({
      userId: userId,
    });

    console.log("[Circle] User token created:", {
      userToken: tokenResponse.data?.userToken?.substring(0, 10) + "...",
      encryptionKey:
        tokenResponse.data?.encryptionKey?.substring(0, 10) + "...",
    });

    // 3. Create PIN/wallet challenge (using SOL-DEVNET and EOA)
    console.log(
      "[Circle] Creating PIN/wallet challenge with EOA account type..."
    );

    const challengeResponse = await circleUserSdk.createUserPinWithWallets({
      userId: userId,
      blockchains: ["SOL-DEVNET"],
      accountType: "EOA",
    });

    console.log("[Circle] Challenge response received");
    console.log("[Circle] Response keys:", Object.keys(challengeResponse));
    console.log("[Circle] Response data:", challengeResponse.data);
    console.log("[Circle] Response status:", challengeResponse.status);

    const { data } = challengeResponse;

    if (!data?.challengeId) {
      console.error("[Circle] No challengeId in response data:", data);
      return NextResponse.json(
        {
          error: "Failed to initialize user and get challengeId",
          response: challengeResponse,
          data: data,
        },
        { status: 500 }
      );
    }

    console.log("[Circle] Successfully got challengeId:", data.challengeId);

    // Return the new user token and challengeId
    return NextResponse.json({
      challengeId: data.challengeId,
      userToken: tokenResponse.data?.userToken,
      encryptionKey: tokenResponse.data?.encryptionKey,
      userId: userId,
    });
  } catch (error: unknown) {
    let details = undefined;
    let message = "Internal server error";
    if (typeof error === "object" && error !== null) {
      if ("response" in error && typeof (error as any).response === "object") {
        details = (error as any).response?.data;
        message = (error as any).response?.data?.message || message;
      } else if ("message" in error) {
        message = (error as any).message;
      }
    } else if (typeof error === "string") {
      message = error;
    }
    console.error("[Circle] Error initializing wallet:", {
      error: error,
      details: details,
      message: message,
      fullError: JSON.stringify(error, null, 2),
    });
    return NextResponse.json(
      {
        error: message,
        details: details,
        fullError: error,
      },
      { status: 500 }
    );
  }
}
