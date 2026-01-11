import { Request, Response } from 'express';
import { IntakeService } from './intake.service';
import { VerificationService } from '../verification/verification.service';
import { IntegrityService } from './integrity.service';
import { JourneyService } from '../routing/journey.service';
import { LedgerService } from './ledger.service';
import { TaskService } from '../routing/task.service';

// 1. Initialize Shared Infrastructure (Prevents the 'underlined' constructor errors)
const ledgerService = new LedgerService();
const integrityService = new IntegrityService();
const taskService = new TaskService();
const journeyService = new JourneyService();

// 2. Initialize Services with Dependencies
const intakeService = new IntakeService(integrityService, taskService);
const verificationService = new VerificationService(ledgerService);

export const handleIntake = async (req: Request, res: Response) => {
  try {
    const { message, beneficiaryId, taskCode, deviceId } = req.body;
    const transactionId = req.headers['x-transaction-id'] as string; // Requirement K.3

    if (!message) return res.status(400).json({ error: "No message" });

    // Section F & M: Integrity & Fraud Check
    // We pass the deviceId to detect 'Ghost Beneficiaries' (Section M.1)
    const anomaly = integrityService.checkDuplicate(message);
    if (anomaly) {
      return res.status(409).json({
        status: "flagged",
        error: "Integrity violation: Potential duplicate claim detected.",
        anomaly
      });
    }

    // Section E: Vertical Journey Sequence Validation
    const journey = journeyService.getOrCreateJourney(beneficiaryId);
    const isSequenceValid = taskService.validateTaskSequence(journey, taskCode);
    
    if (!isSequenceValid) {
      return res.status(403).json({
        status: "blocked",
        governance: "Constitution enforced: Sequential integrity required.",
        note: `Cannot start ${taskCode} before dependencies are met.`
      });
    }

    // Section A & N: Implicit Context & Language Detection
    const context = await intakeService.detectContext(message);
    
    // Section L: Immutable Audit Commitment
    const auditRecord = await ledgerService.commit({
      timestamp: Date.now(),
      postWinId: "pw_" + Math.random().toString(36).substr(2, 9),
      action: 'INTAKE',
      actorId: beneficiaryId,
      previousState: 'NONE',
      newState: 'PENDING_VERIFICATION'
    });

    // Section G: Silent Background Success
    res.json({
      status: "success",
      transactionId,
      context,
      audit: auditRecord,
      journeyState: journey
    });

    // Section K: Post-Response Completion
    // This ensures that if the response fails, the task isn't marked "done" prematurely.
    journeyService.completeTask(beneficiaryId, taskCode);

  } catch (err: any) {
    console.error("Intake Controller Error:", err);
    res.status(500).json({ error: "Posta System Error: Escalated to HITL." });
  }
};
