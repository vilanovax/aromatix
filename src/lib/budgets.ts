import { faNum } from "@/lib/format";

export const BUDGET_SETTING_KEY = "guide-budgets";
export const DEFAULT_BUDGET_MILLIONS = [2, 5, 8, 12] as const;

export type BudgetChoice = { id: number; label: string };

let live: BudgetChoice[] = DEFAULT_BUDGET_MILLIONS.map(choice);

export function budgetChoices() {
  return live;
}

export function installBudgets(millions: readonly number[] | undefined) {
  const clean = millions ? cleanBudgetMillions([...millions]) : null;
  live = (clean ?? [...DEFAULT_BUDGET_MILLIONS]).map(choice);
}

/** The next ceiling under the current one. With no ceiling, the step just below the top. */
export function lowerBudget(current: number | null) {
  const desc = [...live].sort((a, b) => b.id - a.id);
  if (current == null) return desc[1]?.id ?? desc[0]?.id ?? null;
  return desc.find((step) => step.id < current)?.id ?? null;
}

export function higherBudget(current: number) {
  return [...live].sort((a, b) => a.id - b.id).find((step) => step.id > current)?.id ?? null;
}

export function smallestBudget() {
  return [...live].sort((a, b) => a.id - b.id)[0]?.id ?? DEFAULT_BUDGET_MILLIONS[0];
}

export function budgetLabel(million: number) {
  return `تا ${faNum(million)} میلیون`;
}

export function parseBudgetMillions(value: string | null | undefined) {
  if (!value) return null;
  return cleanBudgetMillions(value.split(","));
}

/** Four different whole millions, from 1 to 50, sorted low to high. */
export function cleanBudgetMillions(input: readonly unknown[]) {
  if (input.length !== 4) return null;
  const numbers = input.map((item) => {
    if (typeof item === "number") return item;
    if (typeof item !== "string") return Number.NaN;
    const normalized = item.trim().replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
    return Number(normalized);
  });
  if (numbers.some((value) => !Number.isInteger(value) || value < 1 || value > 50)) return null;
  if (new Set(numbers).size !== 4) return null;
  return [...numbers].sort((a, b) => a - b);
}

function choice(million: number): BudgetChoice {
  return { id: million, label: budgetLabel(million) };
}
