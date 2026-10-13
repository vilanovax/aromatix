#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/2c4e03acf6879451170b3dfbcb5bb8fe9fe27f585331a08f86bc020d7dae9281/contract';
import endContract from '../../snapshots/2c4e03acf6879451170b3dfbcb5bb8fe9fe27f585331a08f86bc020d7dae9281/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/c1778b63d5c8ef13f1014a50f6ae7f3e8519c835737b74e2d7336d64220ce3e8/contract';
import startContract from '../../snapshots/c1778b63d5c8ef13f1014a50f6ae7f3e8519c835737b74e2d7336d64220ce3e8/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'aroma',
        table: 'UsageEvent',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('kind', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('subject', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'aroma',
        table: 'UsageEvent',
        index: 'UsageEvent_createdAt_idx_9575dbd7',
        columns: ['createdAt'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
