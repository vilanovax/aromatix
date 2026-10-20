#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/338d96a33a53e46583db7a9d910f99715bc19386668d5ff7c1d2c2457dca1295/contract';
import endContract from '../../snapshots/338d96a33a53e46583db7a9d910f99715bc19386668d5ff7c1d2c2457dca1295/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/fe4223143f00f76193c1f086a2d10cd848663727c90fd18645be5c154412028b/contract';
import startContract from '../../snapshots/fe4223143f00f76193c1f086a2d10cd848663727c90fd18645be5c154412028b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'aroma',
        table: 'AppSetting',
        columns: [
          col('key', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('value', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['key'])],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
