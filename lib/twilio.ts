import twilio from "twilio";
import { parsePhoneNumberFromString } from "libphonenumber-js";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getTwilioClient() {
  const accountSid = getRequiredEnv("TWILIO_ACCOUNT_SID");
  const authToken = getRequiredEnv("TWILIO_AUTH_TOKEN");
  return twilio(accountSid, authToken);
}

export function normalizeAndValidatePhoneNumber(input: string, defaultCountry = "US"): string | null {
  const parsed = parsePhoneNumberFromString(input, defaultCountry);
  if (!parsed || !parsed.isValid()) {
    return null;
  }
  return parsed.number;
}
