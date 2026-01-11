import { Request, Response, NextFunction } from 'express';

const processedTransactions = new Set<string>();

/**
 * Section K: Idempotency Logic
 * Prevents duplicate PostWins from unstable retries
 */
export const idempotencyGuard = (req: Request, res: Response, next: NextFunction) => {
  const transactionId = req.headers['x-transaction-id'] as string;

  if (!transactionId) {
    return res.status(400).json({ error: "Missing x-transaction-id for offline-first sync" });
  }

  if (processedTransactions.has(transactionId)) {
    // Return 202 Accepted: We already have it, don't re-process
    return res.status(202).json({ message: "Transaction already synced" });
  }

  processedTransactions.add(transactionId);
  next();
};
