import { AuditRecord } from "@posta/core";
import { createHash, createSign, createVerify, generateKeyPairSync } from "crypto";
import fs from "fs";
import path from "path";

export class LedgerService {
  private ledgerPath = path.join(__dirname, "../../../audit_ledger.json");
  private privateKey: string;
  public publicKey: string;

  constructor() {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    this.privateKey = privateKey.export({ type: 'pkcs8', format: 'pem' }) as string;
    this.publicKey = publicKey.export({ type: 'spki', format: 'pem' }) as string;
    
    if (!fs.existsSync(this.ledgerPath)) {
      fs.writeFileSync(this.ledgerPath, JSON.stringify([]));
    }
  }

  /**
   * Section L.4: Data Retrieval
   * Scans the ledger for all records associated with a specific PostWin.
   * Resolves the underline in VerificationService.
   */
  public getAuditTrail(postWinId: string): AuditRecord[] {
    const allRecords = this.loadLedger();
    return allRecords.filter(record => record.postWinId === postWinId);
  }

  /**
   * Section L.1 & L.3: Records status changes, signs them, and returns the full record
   */
  async commit(record: Omit<AuditRecord, 'commitmentHash' | 'signature'>): Promise<AuditRecord> {
    const commitmentHash = this.generateHash(record);
    
    const sign = createSign('SHA256');
    sign.update(commitmentHash);
    const signature = sign.sign(this.privateKey, 'hex');

    const fullRecord: AuditRecord = {
      ...record,
      commitmentHash,
      signature
    };

    const currentLedger = this.loadLedger();
    currentLedger.push(fullRecord);
    fs.writeFileSync(this.ledgerPath, JSON.stringify(currentLedger, null, 2));

    return fullRecord; 
  }

  /**
   * Section L.2: Deterministic SHA-256 Hashing
   */
  generateHash(data: any): string {
    return createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  /**
   * Section L.5: Verification Logic
   */
  verifyLedgerIntegrity(): boolean {
    const records = this.loadLedger();
    for (const record of records) {
      const { commitmentHash, signature, ...data } = record;
      if (this.generateHash(data) !== commitmentHash) return false;
      const verify = createVerify('SHA256');
      verify.update(commitmentHash);
      if (!verify.verify(this.publicKey, signature, 'hex')) return false;
    }
    return true;
  }

  private loadLedger(): AuditRecord[] {
    try {
      if (!fs.existsSync(this.ledgerPath)) return [];
      const data = fs.readFileSync(this.ledgerPath, 'utf8');
      return JSON.parse(data);
    } catch (e) { 
      return []; 
    }
  }
}
