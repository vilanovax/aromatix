#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/338d96a33a53e46583db7a9d910f99715bc19386668d5ff7c1d2c2457dca1295/contract';
import startContract from '../../snapshots/338d96a33a53e46583db7a9d910f99715bc19386668d5ff7c1d2c2457dca1295/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/f4d0b9c4ec00c60c57676c36f69d11b9da9e469ad6a76587446be3db1513a94f/contract';
import endContract from '../../snapshots/f4d0b9c4ec00c60c57676c36f69d11b9da9e469ad6a76587446be3db1513a94f/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'aroma',
        table: 'CatalogReport',
        columns: [
          col('adminNote', 'text', {
            notNull: true,
            default: lit(''),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('body', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('perfumeSlug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('resolvedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('open'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('topic', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'CatalogReport_status_check_8eef8884',
            `"status" IN ('open', 'fixed', 'dismissed')`,
          ),
          checkExpression(
            'CatalogReport_topic_check_14ecc761',
            `"topic" IN ('price', 'identity', 'scent', 'shop', 'other')`,
          ),
        ],
      }),
      this.createIndex({
        schema: 'aroma',
        table: 'CatalogReport',
        index: 'CatalogReport_perfumeSlug_idx_cf34a880',
        columns: ['perfumeSlug'],
      }),
      this.createIndex({
        schema: 'aroma',
        table: 'CatalogReport',
        index: 'CatalogReport_status_createdAt_idx_58610442',
        columns: ['status', 'createdAt'],
      }),
      this.createIndex({
        schema: 'aroma',
        table: 'CatalogReport',
        index: 'CatalogReport_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'aroma',
        table: 'CatalogReport',
        foreignKey: {
          name: 'CatalogReport_userId_fkey',
          columns: ['userId'],
          references: { schema: 'aroma', table: 'User', columns: ['id'] },
          onDelete: 'setNull',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
