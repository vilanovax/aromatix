const fa = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 });

export function faNum(value: number) {
  return fa.format(value);
}

const COUNT = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت"];

export function countWord(value: number) {
  return COUNT[value] ?? faNum(value);
}

const ORDINAL = ["", "اول", "دوم", "سوم", "چهارم", "پنجم", "ششم", "هفتم", "هشتم"];

export function ordinalWord(value: number) {
  return ORDINAL[value] ?? faNum(value);
}

export function millionToman(toman: number) {
  return `${faNum(toman / 1_000_000)} میلیون تومان`;
}

export function joinFa(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} و ${items[1]}`;
  return `${items.slice(0, -1).join("، ")} و ${items[items.length - 1]}`;
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
