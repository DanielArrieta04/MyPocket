
import { computed, inject, Injectable, signal } from '@angular/core';

import type { Account, AccountType } from '../models/account.model';
import type { Transaction } from '../models/transaction.model';
import { AccountService } from '../services/account.service';
import {
  TransactionService
} from '../services/transaction.service';
import type {
  MovementType
} from '../services/transaction.service';

@Injectable({
  providedIn: 'root'
})
export class FinanceStore {
  private readonly accountService = inject(AccountService);
  private readonly transactionService = inject(TransactionService);

  // Estado interno
  private readonly _accounts = signal<Account[]>([]);
  private readonly _transactions = signal<Transaction[]>([]);
  private readonly _loading = signal(true);

  // Estado de solo lectura para las pantallas
  readonly accounts = this._accounts.asReadonly();
  readonly transactions = this._transactions.asReadonly();
  readonly loading = this._loading.asReadonly();

  // Saldos calculados automáticamente
  readonly balances = computed(() => {
    const result = new Map<string, number>();

    for (const account of this._accounts()) {
      result.set(account.id, account.openingBalance);
    }

    for (const movement of this._transactions()) {
      const current = result.get(movement.accountId);

      if (current === undefined) continue;

      const isIncome =
        movement.type === 'income' ||
        movement.type === 'transfer_in';

      const difference = isIncome
        ? movement.amount
        : -movement.amount;

      result.set(movement.accountId, current + difference);
    }

    return result;
  });

  readonly totalBalance = computed(() =>
    Array.from(this.balances().values())
      .reduce((total, balance) => total + balance, 0)
  );

  readonly totalIncome = computed(() =>
    this._transactions()
      .filter(movement => movement.type === 'income')
      .reduce((total, movement) => total + movement.amount, 0)
  );

  readonly totalExpenses = computed(() =>
    this._transactions()
      .filter(movement => movement.type === 'expense')
      .reduce((total, movement) => total + movement.amount, 0)
  );

  balanceFor(accountId: string): number {
    return this.balances().get(accountId) ?? 0;
  }

  // Carga inicial desde SQLite
  async load(): Promise<void> {
    this._loading.set(true);

    try {
      const accounts = await this.accountService.getAll();
      const movements = await this.transactionService.getAll();

      this._accounts.set(accounts);
      this._transactions.set(movements);
    } finally {
      this._loading.set(false);
    }
  }

  // Crear cuenta y actualizar estado
  async addAccount(
    name: string,
    type: AccountType,
    openingBalance: number
  ): Promise<Account> {
    const account = await this.accountService.create(
      name,
      type,
      openingBalance
    );

    this._accounts.update(accounts => [account, ...accounts]);

    return account;
  }

  // Registrar movimiento y actualizar estado
  async addMovement(
    accountId: string,
    type: MovementType,
    amount: number,
    description: string
  ): Promise<Transaction> {
    const movement = await this.transactionService.create(
      accountId,
      type,
      amount,
      description
    );

    this._transactions.update(movements => [
      movement,
      ...movements
    ]);

    return movement;
  }
}
