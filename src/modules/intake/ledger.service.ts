import { AuditRecord, LedgerCommitment } from "@posta/core";
import { createHash } from "crypto";

export class LedgerService {
  private ledger: AuditRecord[] = [];

  /**
   * Section L.1: Records every status change to a private ledger
   */
  async commit(record: Omit<AuditRecord, 'commitmentHash'>): Promise<LedgerCommitment> {
    const commitmentHash = this.generateHash(record);
    
    const fullRecord: AuditRecord = {
      ...record,
      commitmentHash
    };

    this.ledger.push(fullRecord);

    // Section L.3: Return signature (mocking a private key sign)
    return {
      hash: commitmentHash,
      signature: `sig_${Math.random().toString(36).substring(7)}`
    };
  }

  /**
   * Section L.2: Hashed Evidence Commitment
   * Proves evidence existed without storing the file itself
   */
  generateHash(data: any): string {
    return createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  getAuditTrail(postWinId: string): AuditRecord[] {
    return this.ledger.filter(r => r.postWinId === postWinId);
  }
}
