import { Request, Response } from 'express';
import { PostWin, AuditRecord } from '@posta/core'; 
import { LedgerService } from '../intake/ledger.service';
import { VerificationService } from './verification.service';

// Initialize infrastructure
const ledgerService = new LedgerService();
const verificationService = new VerificationService(ledgerService);

/**
 * Handles multi-verifier consensus (Section D.5).
 * Transitions PostWin to 'VERIFIED' only after required consensus is met.
 */
export const handleVerify = async (req: Request, res: Response) => {
  try {
    const { postWinId, verifierId, sdgGoal, notes } = req.body;

    // 1. Validation of required consensus fields
    if (!postWinId || !verifierId || !sdgGoal) {
      return res.status(400).json({ 
        error: "Missing required fields: postWinId, verifierId, and sdgGoal are mandatory." 
      });
    }

    // 2. Retrieve state from Ledger (Section D)
    let postWin: PostWin | null = await verificationService.getPostWinById(postWinId);

    if (!postWin) {
      return res.status(404).json({ error: "PostWin not found in immutable ledger." });
    }

    // 3. Security: Prevent duplicate verification or self-verification logic is inside recordVerification
    // We update the local object and check for consensus
    try {
      // Mocking a required VerificationRecord if it's a fresh reconstruction for testing
      if (postWin.verificationRecords.length === 0) {
        postWin.verificationRecords.push({
          sdgGoal: sdgGoal,
          requiredVerifiers: 2, // Example threshold
          receivedVerifications: [],
          consensusReached: false,
          timestamps: { routedAt: new Date().toISOString() }
        });
      }

      // 4. Section D.5: Process the verification attempt
      // This internally calls ledgerService.commit when consensus is hit
      postWin = await verificationService.recordVerification(postWin, verifierId, sdgGoal);

      // 5. Response logic
      const isComplete = postWin.verificationStatus === 'VERIFIED';
      
      res.json({
        status: "success",
        message: isComplete 
          ? "Consensus reached. PostWin is now VERIFIED." 
          : "Approval recorded. Waiting for additional verifiers.",
        postWin: postWin,
        consensusReached: isComplete
      });

    } catch (error: any) {
      // Catch business logic errors (Self-verification, target not found, etc.)
      return res.status(403).json({ error: error.message });
    }

  } catch (err: any) {
    console.error("Verification Controller Error:", err);
    res.status(500).json({ error: "Posta System Error: Verification orchestration failed." });
  }
};
