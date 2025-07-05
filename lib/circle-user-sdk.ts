import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";

if (!process.env.CIRCLE_API_KEY) {
  throw new Error("Missing CIRCLE_API_KEY environment variable");
}

const circleApiBaseUrl =
  process.env.CIRCLE_API_BASE_URL ?? "https://api.circle.com";

export const circleUserSdk = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY,
  baseUrl: circleApiBaseUrl,
  userAgent: "teleHealthSol",
});
