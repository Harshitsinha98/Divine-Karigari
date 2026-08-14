// Phone-only sign-ins get a synthetic email like
// "919653043939@phone.divine-karigari.in" so the unique/required email
// column can be populated. This is an internal placeholder and must never
// be shown to the customer as their real email address.
const PLACEHOLDER_EMAIL_DOMAIN = "@phone.divine-karigari.in";

export function isPlaceholderEmail(email?: string | null): boolean {
  return Boolean(email && email.toLowerCase().endsWith(PLACEHOLDER_EMAIL_DOMAIN));
}

// Returns the email only if it is a real (non-placeholder) address,
// otherwise an empty string so inputs/labels stay clean.
export function realEmailOrEmpty(email?: string | null): string {
  return isPlaceholderEmail(email) ? "" : (email ?? "");
}
