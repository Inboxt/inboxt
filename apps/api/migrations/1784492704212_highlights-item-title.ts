import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.addColumn('highlight', {
		savedItemTitle: 'text',
		savedItemOriginalUrl: 'text',
	});
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.dropColumn('highlight', ['savedItemTitle', 'savedItemOriginalUrl']);
}
