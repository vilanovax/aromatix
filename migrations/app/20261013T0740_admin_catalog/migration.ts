#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/c1778b63d5c8ef13f1014a50f6ae7f3e8519c835737b74e2d7336d64220ce3e8/contract';
import endContract from '../../snapshots/c1778b63d5c8ef13f1014a50f6ae7f3e8519c835737b74e2d7336d64220ce3e8/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/e1186fcb7cb8871c2b2718b21124423bac8fc5be90090e815527326c3a896bc3/contract';
import startContract from '../../snapshots/e1186fcb7cb8871c2b2718b21124423bac8fc5be90090e815527326c3a896bc3/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'aroma',
        table: 'CatalogBrand',
        columns: [
          col('nameEn', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('nameFa', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['slug'])],
      }),
      this.createTable({
        schema: 'aroma',
        table: 'CatalogPerfume',
        columns: [
          col('brandSlug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('document', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('nameEn', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('nameFa', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['slug'])],
      }),
      this.addColumn({
        schema: 'aroma',
        table: 'User',
        column: col('role', 'text', {
          notNull: true,
          default: lit('member'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addCheckConstraint({
        schema: 'aroma',
        table: 'User',
        constraint: 'User_role_check_f6a6b253',
        expression: `"role" IN ('member', 'admin')`,
      }),
      this.createIndex({
        schema: 'aroma',
        table: 'CatalogPerfume',
        index: 'CatalogPerfume_brandSlug_idx_a888b2c1',
        columns: ['brandSlug'],
      }),
      this.addForeignKey({
        schema: 'aroma',
        table: 'CatalogPerfume',
        foreignKey: {
          name: 'CatalogPerfume_brandSlug_fkey',
          columns: ['brandSlug'],
          references: { schema: 'aroma', table: 'CatalogBrand', columns: ['slug'] },
          onDelete: 'restrict',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
