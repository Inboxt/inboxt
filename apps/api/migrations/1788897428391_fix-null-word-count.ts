import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.sql(`
		UPDATE "saved_item"
		SET "wordCount" = 0
		WHERE "wordCount" IS NULL;
	`);

	pgm.alterColumn('saved_item', 'wordCount', {
		default: 0,
	});
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.alterColumn('saved_item', 'wordCount', {
		default: null,
	});
}
