#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/2881b659955a85f5148abee250f47298cdbd25bac7889a99a71d15ee5f498cde/contract';
import startContract from '../../snapshots/2881b659955a85f5148abee250f47298cdbd25bac7889a99a71d15ee5f498cde/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/6c5bb9bf776b396ea9b5b6e6658d591dbed6cd22c1a3f2b4a9837e697861a640/contract';
import endContract from '../../snapshots/6c5bb9bf776b396ea9b5b6e6658d591dbed6cd22c1a3f2b4a9837e697861a640/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'aroma',
        table: 'User',
        column: col('access', 'text', {
          notNull: true,
          default: lit('*'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
