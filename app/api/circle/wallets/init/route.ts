import { NextRequest, NextResponse } from "next/server";
import { circleUserSdk } from "@/lib/circle-user-sdk";

export async function POST(req: NextRequest) {
  try {
    const { userToken } = await req.json();

    if (!userToken) {
      return NextResponse.json(
        { error: "userToken is required" },
        { status: 400 }
      );
    }

    const { data } = await circleUserSdk.createUserPinWithWallets({
      userToken,
      accountType: "EOA",
      // Based on project name, assuming Solana devnet. Change if needed.
      blockchains: ["SOL-DEVNET"],
    });

    if (!data?.challengeId) {
      return NextResponse.json(
        { error: "Failed to initialize user and get challengeId" },
        { status: 500 }
      );
    }

    return NextResponse.json({ challengeId: data.challengeId });
  } catch (error) {
    console.error(
      "Error initializing wallet:",
      error?.response?.data || error.message
    );
    return NextResponse.json(
      { error: "Internal server error", details: error?.response?.data },
      { status: 500 }
    );
  }
}
