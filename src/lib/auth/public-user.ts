import type { AvatarId } from "@/lib/auth/avatars";

export type PublicUser = {
  id: number;
  name: string;
  avatarId: AvatarId;
  phone: string;
};
