export const AVATARS = [
  { id: "ink", label: "دریا" },
  { id: "brass", label: "برنج" },
  { id: "moss", label: "مه" },
  { id: "clay", label: "سفال" },
  { id: "well", label: "سنگ" },
  { id: "tide", label: "موج" },
  { id: "leaf", label: "برگ" },
  { id: "sand", label: "شن" },
] as const;

export type AvatarId = (typeof AVATARS)[number]["id"];

export function isAvatarId(value: string): value is AvatarId {
  return AVATARS.some((avatar) => avatar.id === value);
}

export function avatarLabel(id: string) {
  return AVATARS.find((avatar) => avatar.id === id)?.label ?? AVATARS[0].label;
}
