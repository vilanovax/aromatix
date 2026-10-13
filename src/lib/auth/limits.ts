const WINDOW_MS = 15 * 60 * 1000;
const LIMIT = 10;

export function loginWindowStart() {
  return new Date(Date.now() - WINDOW_MS).toISOString();
}

export const LOGIN_LIMIT = LIMIT;
export const LOCKED_MESSAGE = "چند بار رمز اشتباه وارد شده. یک ربع دیگر دوباره امتحان کن.";
export const UNAVAILABLE_MESSAGE = "الان حساب در دسترس نیست. کمی بعد دوباره امتحان کن.";
