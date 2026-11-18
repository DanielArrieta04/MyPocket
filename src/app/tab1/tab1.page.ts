
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import type { OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar
} from '@ionic/angular';

import type { Account, AccountType } from '../core/models/account.model';
import type { MovementType } from '../core/services/transaction.service';
import { FinanceStore } from '../core/store/finance.store';

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: true,
  imports: [
  CommonModule,
  FormsModule,
  IonButton,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar
]

})
export class Tab1Page implements OnInit {
  private readonly finance = inject(FinanceStore);

  // Estado reactivo
  readonly accounts = this.finance.accounts;
  readonly transactions = this.finance.transactions;
  readonly loading = this.finance.loading;
  readonly totalBalance = this.finance.totalBalance;
  readonly totalIncome = this.finance.totalIncome;
  readonly totalExpenses = this.finance.totalExpenses;

  readonly saving = signal(false);
  readonly error = signal('');

  // Formulario de cuentas
  name = '';
  type: AccountType = 'wallet';
  openingBalance: number | null = null;

  // Formulario de movimientos
  selectedAccountId = '';
  movementType: MovementType = 'expense';
  movementAmount: number | null = null;
  movementDescription = '';

  async ngOnInit(): Promise<void> {
    this.error.set('');

    try {
      await this.finance.load();

      this.selectedAccountId =
        this.accounts()[0]?.id ?? '';
    } catch (error) {
      console.error(error);
      this.error.set('No se pudieron cargar los datos.');
    }
  }

  getAccountBalance(account: Account): number {
    return this.finance.balanceFor(account.id);
  }

  getAccountName(accountId: string): string {
    return this.accounts().find(
      account => account.id === accountId
    )?.name ?? 'Cuenta desconocida';
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  }

  async createAccount(): Promise<void> {
    if (this.saving() || this.loading()) return;

    this.saving.set(true);
    this.error.set('');

    try {
      const account = await this.finance.addAccount(
        this.name,
        this.type,
        this.openingBalance ?? 0
      );

      if (!this.selectedAccountId) {
        this.selectedAccountId = account.id;
      }

      this.name = '';
      this.type = 'wallet';
      this.openingBalance = null;
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'No se pudo crear la cuenta.'
      );
    } finally {
      this.saving.set(false);
    }
  }

  async createMovement(): Promise<void> {
    if (this.saving() || this.loading()) return;

    this.saving.set(true);
    this.error.set('');

    try {
      await this.finance.addMovement(
        this.selectedAccountId,
        this.movementType,
        this.movementAmount ?? 0,
        this.movementDescription
      );

      this.movementAmount = null;
      this.movementDescription = '';
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'No se pudo guardar el movimiento.'
      );
    } finally {
      this.saving.set(false);
    }
  }
}
