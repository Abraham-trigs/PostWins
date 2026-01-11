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

    // Security: Prevent self-verification
    if (verifierId === postWin.beneficiaryId) { // Assuming beneficiaryId is the author
      throw new Error("Authors cannot self-verify claims.");
    }

    /**
     * CAPTURE VERIFICATION ATTEMPT
     * Logic ensures every unique approval is pushed and audited before checking consensus.
     */
    if (!record.receivedVerifications.includes(verifierId)) {
      record.receivedVerifications.push(verifierId);
      
      // LOG INDIVIDUAL VERIFICATION TO AUDIT TRAIL
      postWin.auditTrail = postWin.auditTrail || [];
      postWin.auditTrail.push({
        action: 'VERIFIER_APPROVED',
        actor: verifierId,
        timestamp: new Date().toISOString(),
        note: `Approval recorded for ${sdgGoal}`
      });
    }

    /**
     * EVALUATE CONSENSUS
     */
    if (record.receivedVerifications.length >= record.requiredVerifiers) {
      record.consensusReached = true;
      postWin.verificationStatus = 'VERIFIED';
      
      // Commit final verification state to the Ledger
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
