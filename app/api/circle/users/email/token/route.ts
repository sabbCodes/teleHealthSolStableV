import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const { email, idempotencyKey, deviceId } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const payload = {
    idempotencyKey: idempotencyKey || uuidv4(),
    email,
    ...(deviceId && { deviceId }), // Only include deviceId if it exists
  };
  console.log(
    "[Circle] Sending payload to /v1/w3s/users/email/token:",
    payload
  );

  try {
    const res = await fetch("https://api.circle.com/v1/w3s/users/email/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log("[Circle] Response from /v1/w3s/users/email/token:", data);
    if (!res.ok) {
      throw new Error(data.message || "Failed to start email OTP flow");
    }

    // Return everything needed for the frontend
    return NextResponse.json(data.data);
  } catch (error: any) {
    console.error("Error in email token route:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
