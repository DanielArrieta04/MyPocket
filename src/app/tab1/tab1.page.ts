
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  IonButton,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar
} from '@ionic/angular';


import { Account, AccountType } from '../core/models/account.model';
import { AccountService } from '../core/services/account.service';

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
  private readonly accountService = inject(AccountService);

  accounts: Account[] = [];

  name = '';
  type: AccountType = 'wallet';
  openingBalance: number | null = null;

  loading = true;
  saving = false;
  error = '';

  get totalBalance(): number {
    return this.accounts.reduce(
      (total, account) => total + account.openingBalance,
      0
    );
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value);
  }

  async ngOnInit(): Promise<void> {
    await this.loadAccounts();
  }

  async loadAccounts(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      this.accounts = await this.accountService.getAll();
    } catch (error) {
      console.error(error);
      this.error = 'No se pudieron cargar las cuentas.';
    } finally {
      this.loading = false;
    }
  }

  async createAccount(): Promise<void> {
    if (this.saving) return;

    this.error = '';
    this.saving = true;

    try {
      await this.accountService.create(
        this.name,
        this.type,
        this.openingBalance ?? 0
      );

      this.name = '';
      this.type = 'wallet';
      this.openingBalance = null;

      await this.loadAccounts();
    } catch (error) {
      this.error = error instanceof Error
        ? error.message
        : 'No se pudo crear la cuenta';
    } finally {
      this.saving = false;
    }
  }
}
