
export type TransactionType =
  | 'income'
  | 'expense'
  | 'transfer_in'
  | 'transfer_out';

export type TransactionSource =
  | 'manual'
  | 'import'
  | 'bank';

export interface Transaction {
  id: string;
  accountId: string;
  categoryId: string | null;
  type: TransactionType;
  amount: number;
  date: string;
  description: string;
  source: TransactionSource;
  externalId: string | null;
  transferId: string | null;
  createdAt: string;
}
