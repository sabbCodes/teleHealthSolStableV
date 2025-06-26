import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";

if (!process.env.CIRCLE_API_KEY) {
  throw new Error("Missing CIRCLE_API_KEY environment variable");
}

export const circleUserSdk = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY,
});
