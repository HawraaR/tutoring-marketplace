export function firstNameFromEmail(email?: string | null) {
  if (!email) return "there";
  const raw = email.split("@")[0].replace(/[._-]+/g, " ");
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function initialsFromEmail(email?: string | null) {
  if (!email) return "?";
  const name = email.split("@")[0];
  const parts = name.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
