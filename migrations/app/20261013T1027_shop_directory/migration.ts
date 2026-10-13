#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/6429a7381af8d8ede2a62dc3e1592b5b8fb74b473c8934a20f71f78854172fdf/contract';
import endContract from '../../snapshots/6429a7381af8d8ede2a62dc3e1592b5b8fb74b473c8934a20f71f78854172fdf/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/6c5bb9bf776b396ea9b5b6e6658d591dbed6cd22c1a3f2b4a9837e697861a640/contract';
import startContract from '../../snapshots/6c5bb9bf776b396ea9b5b6e6658d591dbed6cd22c1a3f2b4a9837e697861a640/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'aroma',
        table: 'CatalogShop',
        columns: [
          col('active', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('city', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('description', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('instagram', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('nameEn', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('nameFa', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('telegram', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('website', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['slug'])],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
