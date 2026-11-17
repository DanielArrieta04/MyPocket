
export type AccountType = 'cash' | 'bank' | 'wallet';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  openingBalance: number;
  createdAt: string;
}
