function getRequiredPublicEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required public environment variable: ${name}`);
  }
  return value;
}

export function getTollFreeNumber() {
  return getRequiredPublicEnv("NEXT_PUBLIC_TOLL_FREE_NUMBER");
}
