export const MARKER_PREFIX = "GRC";

export function makeStartMarker(id: string) {
  return `<!-- ${MARKER_PREFIX}:${id}:START -->`;
}

export function makeEndMarker(id: string) {
  return `<!-- ${MARKER_PREFIX}:${id}:END -->`;
}

export function verifyMarkers(
  readme: string,
  ids: string[]
): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  for (const id of ids) {
    if (!readme.includes(makeStartMarker(id)) || !readme.includes(makeEndMarker(id))) {
      missing.push(id);
    }
  }
  return { ok: missing.length === 0, missing };
}
