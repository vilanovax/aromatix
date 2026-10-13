#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/2881b659955a85f5148abee250f47298cdbd25bac7889a99a71d15ee5f498cde/contract';
import endContract from '../../snapshots/2881b659955a85f5148abee250f47298cdbd25bac7889a99a71d15ee5f498cde/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/47c089748142910aa29196ca5ff91109ee6c7792aab3cb32b71a14ecd6ff455e/contract';
import startContract from '../../snapshots/47c089748142910aa29196ca5ff91109ee6c7792aab3cb32b71a14ecd6ff455e/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'aroma',
        table: 'LearnArticle',
        columns: [
          col('active', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('display', 'text', {
            notNull: true,
            default: lit('row'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('document', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('publishedOn', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('sort', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['slug'])],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
