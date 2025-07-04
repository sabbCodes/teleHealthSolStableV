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
    const { data } = await circleUserSdk.listWallets({ userToken });
    if (!data?.wallets) {
      return NextResponse.json(
        { error: "No wallets found for user" },
        { status: 404 }
      );
    }
    return NextResponse.json({ wallets: data.wallets });
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
    console.error("Error listing wallets:", details || message);
    return NextResponse.json({ error: message, details }, { status: 500 });
  }
}
