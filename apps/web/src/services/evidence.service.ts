// apps/frontend/src/services/evidence.service.ts
// Purpose: Handles NGO evidence upload flow (hash → presign → upload → commit)

////////////////////////////////////////////////////////////////
// Design reasoning
////////////////////////////////////////////////////////////////
// - Integrity-first: SHA256 calculated client-side before upload.
// - Two-phase commit: presign → direct S3 upload → DB commit.
// - Backend owns storageKey generation for audit consistency.
// - Frontend never constructs storage paths.
// - Flexible domain routing (task | approval | etc).

////////////////////////////////////////////////////////////////
// Structure
////////////////////////////////////////////////////////////////
// - uploadGrantEvidence()
//   - hash file
//   - request presign (backend returns uploadUrl + storageKey)
//   - upload to S3
//   - commit metadata
//
// Dependencies assumed:
// - api (axios instance)
// - calculateSHA256 utility

////////////////////////////////////////////////////////////////
// Implementation
////////////////////////////////////////////////////////////////

export async function uploadGrantEvidence(
  file: File,
  domain: "timeline" | "task" | "verification" | "approval",
  targetId: string,
) {
  // 1️⃣ Generate integrity hash (audit requirement)
  const sha256 = await calculateSHA256(file);

  // 2️⃣ Request presigned upload URL
  const { data: presign } = await api.post("/evidence/presign", {
    filename: file.name,
    mimeType: file.type,
    sha256,
    domain,
    ...(domain === "task"
      ? { caseTaskId: targetId }
      : { approvalRequestId: targetId }),
  });

  if (!presign?.uploadUrl || !presign?.storageKey) {
    throw new Error("Invalid presign response from server.");
  }

  // 3️⃣ Upload directly to S3
  const uploadResponse = await fetch(presign.uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
      "x-amz-checksum-sha256": sha256,
    },
  });

  if (!uploadResponse.ok) {
    throw new Error("S3 upload failed.");
  }

  // 4️⃣ Commit metadata to backend (audit record creation)
  const { data: evidence } = await api.post("/evidence/commit", {
    storageKey: presign.storageKey, // server-generated
    sha256,
    originalFilename: file.name,
    mimeType: file.type,
    byteSize: file.size,
    title: `Evidence for ${domain}`,
    ...(domain === "task"
      ? { caseTaskId: targetId }
      : { approvalRequestId: targetId }),
  });

  return evidence;
}

////////////////////////////////////////////////////////////////
// Scalability insight
////////////////////////////////////////////////////////////////
// - Storage key generation MUST stay server-side to prevent
//   tenant path tampering.
// - Two-phase commit prevents DB pollution if upload fails.
// - Hash validation enables tamper detection + compliance logging.
// - Easily extensible for chunked uploads (multipart S3).
////////////////////////////////////////////////////////////////
