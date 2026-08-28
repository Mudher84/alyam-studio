/**
 * ADMIN ALLOWLIST CONFIGURATION
 * 
 * Add approved administrator Firebase UIDs or Email addresses here.
 * Any user not in this list will be immediately signed out upon login.
 */

export const ALLOWED_ADMIN_UIDS: string[] = [
  // "PASTE_YOUR_FIREBASE_UID_HERE",
];

export const ALLOWED_ADMIN_EMAILS: string[] = [
  "w.mudher@gmail.com", // Adding user's email by default as requested in instructions to include runtime email
];

/**
 * Checks if a user is an authorized administrator.
 */
export function isAuthorizedAdmin(uid: string, email: string | null): boolean {
  if (ALLOWED_ADMIN_UIDS.includes(uid)) return true;
  if (email && ALLOWED_ADMIN_EMAILS.includes(email)) return true;
  return false;
}
