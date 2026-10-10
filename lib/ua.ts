/**
 * Tiny user-agent parser — enough for the Student Logins device card.
 * Kept dependency-free and pure so both the server (auth.ts) and the seed
 * script can share it.
 */

export interface ParsedDevice {
  browser: string;
  os: string;
  deviceType: string;
  userAgent: string;
}

const UA = "(unknown)";

function guessBrowser(ua: string): string {
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua)) return "Safari";
  return "Other";
}

function guessOs(ua: string): string {
  if (/Windows NT/.test(ua)) return "Windows";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Linux/.test(ua)) return "Linux";
  return "Other";
}

function guessDeviceType(ua: string): string {
  if (/iPad/.test(ua)) return "Tablet";
  if (/iPhone|iPod|Mobi/.test(ua)) return "Mobile";
  return "Desktop";
}

export function parseUA(userAgent?: string | null): ParsedDevice {
  const ua = userAgent?.trim() || UA;
  return {
    browser: guessBrowser(ua),
    os: guessOs(ua),
    deviceType: guessDeviceType(ua),
    userAgent: ua,
  };
}