
import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection
} from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;
  private initPromise: Promise<void> | null = null;

  initialize(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.initializeDatabase().catch(error => {
        this.initPromise = null;
        throw error;
      });
    }

    return this.initPromise;
  }

  private async initializeDatabase(): Promise<void> {

    if (Capacitor.getPlatform() === 'web') {
      await customElements.whenDefined('jeep-sqlite');

      const component = document.querySelector('jeep-sqlite') as
        (HTMLElement & { componentOnReady?: () => Promise<unknown> }) | null;

      if (!component) {
        throw new Error('No se encontró jeep-sqlite');
      }

      await component.componentOnReady?.();
      await this.sqlite.initWebStore();
    }

    this.db = await this.sqlite.createConnection(
      'mypocket',
      false,
      'no-encryption',
      1,
      false
    );

    await this.db.open();
    await this.createTables();

    console.log('MyPocket: Base de datos inicializada');
  }

  private async createTables(): Promise<void> {

    if (!this.db) {
      throw new Error('Base de datos no inicializada');
    }

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        opening_balance INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        icon TEXT,
        color TEXT
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        account_id TEXT NOT NULL,
        category_id TEXT,
        type TEXT NOT NULL,
        amount INTEGER NOT NULL CHECK(amount > 0),
        date TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        source TEXT NOT NULL DEFAULT 'manual',
        external_id TEXT,
        transfer_id TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (account_id) REFERENCES accounts(id),
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_account
      ON transactions(account_id);

      CREATE INDEX IF NOT EXISTS idx_transactions_date
      ON transactions(date);
    `);

    await this.save();
  }

  async getConnection(): Promise<SQLiteDBConnection> {
    await this.initialize();

    if (!this.db) {
      throw new Error('No hay conexión a la base de datos');
    }

    return this.db;
  }

  async save(): Promise<void> {
    if (Capacitor.getPlatform() === 'web') {
      await this.sqlite.saveToStore('mypocket');
    }
  }
}
