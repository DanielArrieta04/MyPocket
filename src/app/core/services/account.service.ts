
import { inject, Injectable } from '@angular/core';

import { DatabaseService } from '../database/database.service';
import type { Account, AccountType } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly database = inject(DatabaseService);

  async getAll(): Promise<Account[]> {
    const db = await this.database.getConnection();

    const result = await db.query(`
      SELECT
        id,
        name,
        type,
        opening_balance AS openingBalance,
        created_at AS createdAt
      FROM accounts
      ORDER BY created_at DESC;
    `);

    return (result.values ?? []) as Account[];
  }

  async create(
    name: string,
    type: AccountType,
    openingBalance: number
  ): Promise<Account> {

    const cleanName = name.trim();

    if (!cleanName) {
      throw new Error('El nombre es obligatorio');
    }

    if (!Number.isSafeInteger(openingBalance) || openingBalance < 0) {
      throw new Error('El saldo debe ser un entero positivo o cero');
    }

    const account: Account = {
      id: crypto.randomUUID(),
      name: cleanName,
      type,
      openingBalance,
      createdAt: new Date().toISOString()
    };

    const db = await this.database.getConnection();

    await db.run(
      `INSERT INTO accounts
       (id, name, type, opening_balance, created_at)
       VALUES (?, ?, ?, ?, ?);`,
      [
        account.id,
        account.name,
        account.type,
        account.openingBalance,
        account.createdAt
      ]
    );

    await this.database.save();

    return account;
  }
}
