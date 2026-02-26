// apps/frontend/src/hooks/use-evidence-upload.ts
import { useState } from "react";
import { calculateSHA256 } from "@/lib/crypto";
import { apiClient as api } from "@/lib/api/apiClient";

export type UploadTarget = {
  timelineEntryId?: string;
  caseTaskId?: string;
  verificationRecordId?: string;
  approvalRequestId?: string;
};

export function useEvidenceUpload() {
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (
    file: File,
    target: UploadTarget,
    metadata?: { title?: string; description?: string },
  ) => {
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      // 1. NGO AUDIT: Calculate SHA-256 for Integrity
      const sha256 = await calculateSHA256(file);

      // 2. STEP 1: Get Presigned URL
      const { data: presign } = await api.post("/evidence/presign", {
        ...target,
        filename: file.name,
        mimeType: file.type,
        sha256,
        byteSize: file.size,
      });

      // 3. STORAGE LAYER: Direct S3 Put
      // Using XMLHttpRequest for native progress tracking
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", presign.uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);

        // CRITICAL: Integrity header for S3 to verify the file content
        xhr.setRequestHeader("x-amz-checksum-sha256", sha256);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setProgress(pct);
          }
        };

        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300
            ? resolve(xhr)
            : reject(new Error("S3_UPLOAD_FAILED"));
        xhr.onerror = () => reject(new Error("NETWORK_ERROR"));
        xhr.send(file);
      });

      // 4. STEP 2: Commit to DB Audit Trail
      const { data: commit } = await api.post("/evidence/commit", {
        ...target,
        ...metadata,
        storageKey: presign.storageKey,
        sha256,
        originalFilename: file.name,
        mimeType: file.type,
        byteSize: file.size,
      });

      return commit;
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Upload failed";
      setError(msg);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, progress, isUploading, error };
}
