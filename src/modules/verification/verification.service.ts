// apps/backend/src/modules/verification/verification.service.ts
import { PostWin, VerificationRecord } from "@posta/core";
import { LedgerService } from "../intake/ledger.service";

export class VerificationService {
  constructor(private ledgerService: LedgerService) {}

  async recordVerification(postWin: PostWin, verifierId: string, sdgGoal: string): Promise<PostWin> {
    // FIX: Initialize records if they are undefined to prevent .find() crash
    if (!postWin.verificationRecords) {
      postWin.verificationRecords = [];
    }

    const record = postWin.verificationRecords.find(r => r.sdgGoal === sdgGoal);
    
    if (!record) throw new Error(`Verification target ${sdgGoal} not found.`);
    if (record.consensusReached) return postWin;

    if (verifierId === postWin.authorId) {
      throw new Error("Authors cannot self-verify claims.");
    }

    if (!record.receivedVerifications.includes(verifierId)) {
      record.receivedVerifications.push(verifierId);
    }

    if (record.receivedVerifications.length >= record.requiredVerifiers) {
      record.consensusReached = true;
      postWin.verificationStatus = 'VERIFIED';
      
      await this.ledgerService.commit({
        timestamp: Date.now(),
        postWinId: postWin.id,
        action: 'VERIFIED',
        actorId: verifierId,
        previousState: 'PENDING',
        newState: 'VERIFIED'
      });
    }

    return postWin;
  }
}
