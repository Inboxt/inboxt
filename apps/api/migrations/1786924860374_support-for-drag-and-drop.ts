import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.addColumn('saved_query', {
		order: { type: 'integer', notNull: true, default: 0 },
	});
	pgm.addColumn('label', {
		order: { type: 'integer', notNull: true, default: 0 },
	});
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.dropColumn('saved_query', 'order');
	pgm.dropColumn('label', 'order');
}
