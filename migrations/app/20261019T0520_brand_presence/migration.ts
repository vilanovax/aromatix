#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/dc8f454a74d56a754589f82df0c14cc1f7d81a589fa8f8f6a9ef08a737309938/contract';
import endContract from '../../snapshots/dc8f454a74d56a754589f82df0c14cc1f7d81a589fa8f8f6a9ef08a737309938/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/f4d0b9c4ec00c60c57676c36f69d11b9da9e469ad6a76587446be3db1513a94f/contract';
import startContract from '../../snapshots/f4d0b9c4ec00c60c57676c36f69d11b9da9e469ad6a76587446be3db1513a94f/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'aroma',
        table: 'CatalogBrand',
        column: col('instagram', 'text', {
          notNull: true,
          default: lit(''),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addColumn({
        schema: 'aroma',
        table: 'CatalogBrand',
        column: col('logo', 'text', {
          notNull: true,
          default: lit(''),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addColumn({
        schema: 'aroma',
        table: 'CatalogBrand',
        column: col('website', 'text', {
          notNull: true,
          default: lit(''),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
