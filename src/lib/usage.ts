const sent = new Set<string>();

export function recordUsage(kind: string, subject: string) {
  const key = `${kind}:${subject}`;
  if (!subject || sent.has(key)) return;
  sent.add(key);
  void fetch("/api/usage", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ events: [{ kind, subject }] }),
    keepalive: true,
  }).catch(() => {
    sent.delete(key);
  });
}

export function recordUsages(kind: string, subjects: string[]) {
  const fresh = subjects.filter((subject) => {
    const key = `${kind}:${subject}`;
    if (!subject || sent.has(key)) return false;
    sent.add(key);
    return true;
  });
  if (fresh.length === 0) return;
  void fetch("/api/usage", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ events: fresh.map((subject) => ({ kind, subject })) }),
    keepalive: true,
  }).catch(() => {
    for (const subject of fresh) sent.delete(`${kind}:${subject}`);
  });
}
