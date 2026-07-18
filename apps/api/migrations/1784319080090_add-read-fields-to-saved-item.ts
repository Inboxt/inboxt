import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.addColumn('saved_item', {
		readAt: { type: 'timestamptz', default: null },
		isReadManual: { type: 'boolean', default: false, notNull: true },
	});
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.dropColumn('saved_item', ['readAt', 'isReadManual']);
}
