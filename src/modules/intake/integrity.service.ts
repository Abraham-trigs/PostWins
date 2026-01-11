import { IntegrityFlag, PostWin } from "@posta/core";

export class IntegrityService {
  private processedHashes = new Set<string>();
  // Section M.3: Moved inside class for better encapsulation
  private deviceRegistry = new Map<string, string[]>(); 

  /**
   * Section F & M: Multi-layered integrity check
   */
  public async performFullAudit(postWin: PostWin, rawMessage: string, deviceId?: string): Promise<IntegrityFlag[]> {
    const flags: IntegrityFlag[] = [];

    // 1. Basic Duplicate Check
    const duplicate = this.checkDuplicate(rawMessage);
    if (duplicate) flags.push(duplicate);

    // 2. Ghost Beneficiary Detection (Section M.1)
    if (deviceId) {
      const ghostFlag = this.detectGhostBeneficiary(deviceId, postWin.beneficiaryId);
      if (ghostFlag) flags.push(ghostFlag);
    }

    // 3. Adversarial Input Filtering (Section M.2)
    if (this.isAdversarial(rawMessage)) {
      flags.push({
        type: 'SUSPICIOUS_TONE',
        severity: 'HIGH',
        timestamp: Date.now()
      });
    }

    return flags;
  }

  /**
   * Feature F: Publicly accessible for direct Controller checks
   */
  public checkDuplicate(message: string): IntegrityFlag | null {
    const hash = message.toLowerCase().trim();
    if (this.processedHashes.has(hash)) {
      return { 
        type: 'DUPLICATE_CLAIM', 
        severity: 'HIGH', 
        timestamp: Date.now() 
      };
    }
    this.processedHashes.add(hash);
    return null;
  }

  /**
   * Section M.1: Ghost Beneficiary Detection
   */
  private detectGhostBeneficiary(deviceId: string, beneficiaryId: string): IntegrityFlag | null {
    const linkedBeneficiaries = this.deviceRegistry.get(deviceId) || [];
    
    if (!linkedBeneficiaries.includes(beneficiaryId)) {
      linkedBeneficiaries.push(beneficiaryId);
      this.deviceRegistry.set(deviceId, linkedBeneficiaries);
    }

    // Flag if one device manages > 3 beneficiaries (Threshold for Section M.1)
    if (linkedBeneficiaries.length > 3) {
      return { 
        type: 'IDENTITY_MISMATCH', 
        severity: 'HIGH', 
        timestamp: Date.now() 
      };
    }
    return null;
  }

  /**
   * Section M.2: Adversarial Input Shield
   */
  private isAdversarial(message: string): boolean {
    const patterns = [/ignore previous instructions/i, /system override/i, /<script/i];
    return patterns.some(pattern => pattern.test(message));
  }
}
