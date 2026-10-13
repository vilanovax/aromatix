import { cn } from "@/lib/format";
import { isAvatarId } from "@/lib/auth/avatars";

export function Avatar({ id, className }: { id: string; className?: string }) {
  const avatar = isAvatarId(id) ? id : "ink";
  return <img src={`/avatars/${avatar}.svg`} alt="" className={cn("size-11 rounded-full", className)} />;
}
