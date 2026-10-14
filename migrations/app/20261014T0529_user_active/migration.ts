#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/6429a7381af8d8ede2a62dc3e1592b5b8fb74b473c8934a20f71f78854172fdf/contract';
import startContract from '../../snapshots/6429a7381af8d8ede2a62dc3e1592b5b8fb74b473c8934a20f71f78854172fdf/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/fe4223143f00f76193c1f086a2d10cd848663727c90fd18645be5c154412028b/contract';
import endContract from '../../snapshots/fe4223143f00f76193c1f086a2d10cd848663727c90fd18645be5c154412028b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'aroma',
        table: 'User',
        column: col('active', 'bool', {
          notNull: true,
          default: lit(true),
          codecRef: { codecId: 'pg/bool@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
