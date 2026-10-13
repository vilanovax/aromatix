const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Persian/Arabic-Indic digits → ASCII 0–9; other characters unchanged. */
export function toAsciiDigits(input: string) {
  return input.replace(/[۰-۹٠-٩]/g, (char) => {
    const persian = PERSIAN_DIGITS.indexOf(char);
    if (persian >= 0) return String(persian);
    const arabic = ARABIC_DIGITS.indexOf(char);
    return arabic >= 0 ? String(arabic) : char;
  });
}

/** Canonical form is 989xxxxxxxxx. Returns null when the number is not an Iranian mobile. */
export function normalizePhone(input: string) {
  const digits = toAsciiDigits(input).replace(/\D/g, "");
  let national = digits;
  if (national.startsWith("0098")) national = national.slice(4);
  else if (national.startsWith("98")) national = national.slice(2);
  else if (national.startsWith("0")) national = national.slice(1);
  if (!/^9\d{9}$/.test(national)) return null;
  return `98${national}`;
}

export function displayPhone(stored: string) {
  if (/^98\d{10}$/.test(stored)) return `0${stored.slice(2)}`;
  return stored;
}
