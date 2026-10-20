export const REPORT_TOPICS = [
  { id: "price", label: "قیمت" },
  { id: "identity", label: "نام یا برند" },
  { id: "scent", label: "هرم و نت‌ها" },
  { id: "shop", label: "فروشگاه" },
  { id: "other", label: "چیز دیگر" },
] as const;

export const REPORT_STATUSES = [
  { id: "open", label: "باز" },
  { id: "fixed", label: "اصلاح شد" },
  { id: "dismissed", label: "رد شد" },
] as const;

export type ReportTopicId = (typeof REPORT_TOPICS)[number]["id"];
export type ReportStatusId = (typeof REPORT_STATUSES)[number]["id"];

export function isReportTopic(value: string): value is ReportTopicId {
  return REPORT_TOPICS.some((topic) => topic.id === value);
}

export function isReportStatus(value: string): value is ReportStatusId {
  return REPORT_STATUSES.some((status) => status.id === value);
}

export function reportTopicLabel(id: string) {
  return REPORT_TOPICS.find((topic) => topic.id === id)?.label ?? "گزارش";
}

export function reportStatusLabel(id: string) {
  return REPORT_STATUSES.find((status) => status.id === id)?.label ?? id;
}
