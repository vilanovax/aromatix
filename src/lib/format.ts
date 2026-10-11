const fa = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 });

export function faNum(value: number) {
  return fa.format(value);
}

const COUNT = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت"];

export function countWord(value: number) {
  return COUNT[value] ?? faNum(value);
}

export function millionToman(toman: number) {
  return `${faNum(toman / 1_000_000)} میلیون تومان`;
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
