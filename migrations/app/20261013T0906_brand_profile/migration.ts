#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/2c4e03acf6879451170b3dfbcb5bb8fe9fe27f585331a08f86bc020d7dae9281/contract';
import startContract from '../../snapshots/2c4e03acf6879451170b3dfbcb5bb8fe9fe27f585331a08f86bc020d7dae9281/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/47c089748142910aa29196ca5ff91109ee6c7792aab3cb32b71a14ecd6ff455e/contract';
import endContract from '../../snapshots/47c089748142910aa29196ca5ff91109ee6c7792aab3cb32b71a14ecd6ff455e/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'aroma',
        table: 'CatalogBrand',
        column: col('active', 'bool', {
          notNull: true,
          default: lit(true),
          codecRef: { codecId: 'pg/bool@1' },
        }),
      }),
      this.addColumn({
        schema: 'aroma',
        table: 'CatalogBrand',
        column: col('description', 'text', {
          notNull: true,
          default: lit(''),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
