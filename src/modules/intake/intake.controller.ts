import crypto from 'crypto';
import { Request, Response } from 'express';

// Core Types from @posta/core
import { 
  PostWin, 
  PostaContext, 
  AuditRecord,
  Journey
} from '@posta/core'; 

// Local Service Imports
import { IntakeService } from './intake.service';
import { VerificationService } from '../verification/verification.service';
import { IntegrityService } from './integrity.service';
import { JourneyService } from '../routing/journey.service';
import { LedgerService } from './ledger.service';
import { TaskService } from '../routing/task.service';
import { ToneAdapterService } from './tone-adapter.service';
import { LocalizationService } from './localization.service';
import { SDGMapperService } from './sdg-mapper.service'; // Added

// 1. Initialize Shared Infrastructure
const ledgerService = new LedgerService();
const integrityService = new IntegrityService();
const taskService = new TaskService();
const journeyService = new JourneyService();
const toneAdapter = new ToneAdapterService();
const localizationService = new LocalizationService();
const sdgMapper = new SDGMapperService(); // Added

// 2. Initialize Services with Dependencies
const intakeService = new IntakeService(integrityService, taskService);
const verificationService = new VerificationService(ledgerService);

/**
 * Handles the intake of new messages from beneficiaries.
 * Enforces multi-layered integrity checks (Section F/M), journey validation (Section E),
 * cultural localization (Section N), and SDG goal mapping.
 */
export const handleIntake = async (req: Request, res: Response) => {
  try {
    const { message, beneficiaryId, taskCode, deviceId } = req.body;
    const transactionId = req.headers['x-transaction-id'] as string;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    // --- SECTION F & M: INTEGRITY AUDIT ---
    const postWinSkeleton = { beneficiaryId } as PostWin;
    const integrityFlags = await integrityService.performFullAudit(postWinSkeleton, message, deviceId);
    
    // 1. Handle Permanent Blacklist (403)
    const isBlacklisted = deviceId && integrityFlags.some(f => f.type === 'IDENTITY_MISMATCH' && f.severity === 'HIGH');
    if (isBlacklisted) {
      return res.status(403).json({
        status: "banned",
        error: "Access denied: Permanent flag for repeated violations."
      });
    }

    // 2. Handle Rate Limiting / Cooldown (429)
    const cooldownFlag = integrityFlags.find(f => f.type === 'SUSPICIOUS_TONE' && f.severity === 'LOW');
    if (cooldownFlag) {
      return res.status(429).json({
        status: "throttled",
        error: "Too many requests. Please wait 30 seconds."
      });
    }

    // 3. Handle Fraud/Integrity Violations (409)
    if (integrityFlags.some(f => f.severity === 'HIGH')) {
      return res.status(409).json({
        status: "flagged",
        error: "Integrity violation: Security guardrails triggered.",
        flags: integrityFlags
      });
    }

    // --- SECTION E: JOURNEY VALIDATION ---
    const journey: Journey = journeyService.getOrCreateJourney(beneficiaryId);
    if (!journeyService.validateTaskSequence(journey, taskCode)) {
      return res.status(403).json({
        status: "blocked",
        note: `Prerequisites for ${taskCode} not met.`
      });
    }

    // --- SECTION N: LOCALIZATION & NEUTRALIZATION ---
    const localization = await localizationService.detectCulture(message);
    const neutralizedDescription = await localizationService.neutralizeAndTranslate(message, localization);

    // --- SECTION A, N & G.2: CONTEXT & LITERACY ---
    const detectedContext = await intakeService.detectContext(message);

    // --- SDG MAPPING ---
    // Automatically detects if the claim relates to Education (SDG_4) or Gender Equality (SDG_5)
    const assignedGoals = sdgMapper.mapMessageToGoals(message);

    // Initialize PostWin entity (Compliant with @posta/core)
    const postWin: PostWin = {
      id: "pw_" + crypto.randomBytes(4).toString('hex'),
      taskId: taskCode,
      routingStatus: 'FALLBACK',
      verificationStatus: integrityFlags.length > 0 ? 'FLAGGED' : 'PENDING',
      beneficiaryId,
      authorId: beneficiaryId,
      description: neutralizedDescription,
      sdgGoals: assignedGoals, // Dynamically mapped
      mode: 'AI_AUGMENTED',
      verificationRecords: [],
      auditTrail: [],
      localization
    };

    // --- SECTION L: IMMUTABLE AUDIT ---
    const auditRecord: AuditRecord = await ledgerService.commit({
      timestamp: Date.now(),
      postWinId: postWin.id,
      action: 'INTAKE',
      actorId: beneficiaryId,
      previousState: 'NONE',
      newState: 'PENDING_VERIFICATION'
    });

    // --- REQUIREMENT G.2 & G.3: TONE ADAPTATION ---
    const outcomeMessage = toneAdapter.adaptOutcome(postWin, detectedContext);

    // --- SECTION G: RESPONSE ---
    res.json({
      status: "success",
      message: outcomeMessage, 
      transactionId,
      context: { ...detectedContext, localization },
      audit: auditRecord,
      postWin,
      journeyState: journey
    });

    // --- SECTION K: COMPLETION ---
    journeyService.completeTask(beneficiaryId, taskCode);

  } catch (err: any) {
    console.error("Intake Controller Error:", err);
    res.status(500).json({ error: "Posta System Error: Escalated to Human-in-the-loop (HITL)." });
  }
};
