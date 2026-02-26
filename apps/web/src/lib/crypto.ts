// apps/frontend/src/lib/crypto.ts

export async function calculateSHA256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);

  // S3 Checksum headers usually expect Base64 encoding
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
}
