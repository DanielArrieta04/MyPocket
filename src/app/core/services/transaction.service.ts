
import { inject, Injectable } from '@angular/core';

import { DatabaseService } from '../database/database.service';
import type { Transaction } from '../models/transaction.model';


export type MovementType = 'income' | 'expense';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly database = inject(DatabaseService);

  async getAll(): Promise<Transaction[]> {
    const db = await this.database.getConnection();

    const result = await db.query(`
      SELECT
        id,
        account_id AS accountId,
        category_id AS categoryId,
        type,
        amount,
        date,
        description,
        source,
        external_id AS externalId,
        transfer_id AS transferId,
        created_at AS createdAt
      FROM transactions
      ORDER BY date DESC, created_at DESC;
    `);

    return (result.values ?? []) as Transaction[];
  }

  async create(
    accountId: string,
    type: MovementType,
    amount: number,
    description: string
  ): Promise<Transaction> {
    if (!accountId) {
      throw new Error('Selecciona una cuenta');
    }

    if (type !== 'income' && type !== 'expense') {
      throw new Error('Tipo de movimiento inválido');
    }

    if (!Number.isSafeInteger(amount) || amount <= 0) {
      throw new Error('El valor debe ser un entero mayor que cero');
    }

    const db = await this.database.getConnection();

    const account = await db.query(
      'SELECT id FROM accounts WHERE id = ?;',
      [accountId]
    );

    if (!account.values?.length) {
      throw new Error('La cuenta seleccionada no existe');
    }

    const now = new Date().toISOString();

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      accountId,
      categoryId: null,
      type,
      amount,
      date: now,
      description: description.trim(),
      source: 'manual',
      externalId: null,
      transferId: null,
      createdAt: now
    };

    await db.run(
      `INSERT INTO transactions (
        id, account_id, category_id, type,
        amount, date, description, source,
        external_id, transfer_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        transaction.id,
        transaction.accountId,
        transaction.categoryId,
        transaction.type,
        transaction.amount,
        transaction.date,
        transaction.description,
        transaction.source,
        transaction.externalId,
        transaction.transferId,
        transaction.createdAt
      ]
    );

    await this.database.save();

    return transaction;
  }
}
