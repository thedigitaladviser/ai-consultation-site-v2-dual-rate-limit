import { parsePhoneNumberFromString } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";

export function normalizeAndValidatePhoneNumber(input: string, defaultCountry: CountryCode = "US"): string | null {
  const parsed = parsePhoneNumberFromString(input, defaultCountry);
  if (!parsed || !parsed.isValid()) {
    return null;
  }
  return parsed.number;
}
