import { PostWin, PostaContext } from "@posta/core";
import { IntegrityService } from "./integrity.service";
import { TaskService } from "../routing/task.service";

export class IntakeService {
  constructor(
    private integrityService: IntegrityService,
    private taskService: TaskService
  ) {}

  /**
   * Section A & B: High-level orchestrator
   */
  async handleIntake(message: string, deviceId: string): Promise<Partial<PostWin>> {
    const context = await this.detectContext(message);
    const tempPostWin = { beneficiaryId: 'pending_detection' } as PostWin;
    const flags = await this.integrityService.performFullAudit(tempPostWin, message, deviceId);
    
    if (flags.some(f => f.severity === 'HIGH')) {
       throw new Error("Intake blocked by Integrity Guardrails");
    }

    return {
      description: this.sanitizeDescription(message),
      verificationStatus: flags.length > 0 ? 'FLAGGED' : 'PENDING',
      mode: 'AI_AUGMENTED',
      routingStatus: 'UNASSIGNED'
    };
  }

  /**
   * Section A: Publicly accessible for the Controller to use directly
   */
  public async detectContext(message: string): Promise<PostaContext> {
    const msg = message.toLowerCase();
    let role: PostaContext['role'] = 'AUTHOR';
    if (msg.includes('student') || msg.includes('organization')) role = 'NGO_PARTNER';

    return {
      role,
      isImplicit: true
    };
  }

  /**
   * Section G: Adapts tone and cleans whitespace
   */
  public sanitizeDescription(message: string): string {
    return message.trim().replace(/\s+/g, ' ');
  }
}
