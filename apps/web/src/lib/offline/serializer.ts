// apps/web/src/lib/offline/serializer.ts

export function stableStringify(value: unknown): string {
  return JSON.stringify(sortObject(value));
}

function sortObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObject);
  }

  if (obj && typeof obj === "object") {
    return Object.keys(obj)
      .sort()
      .reduce((acc: any, key) => {
        acc[key] = sortObject(obj[key]);
        return acc;
      }, {});
  }

  return obj;
}

export async function sha256(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
