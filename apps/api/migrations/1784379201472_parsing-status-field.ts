import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.createType('saved_item_parsing_status', ['FAILED', 'PROCESSING', 'PARSED']);
	pgm.addColumn('saved_item', {
		parsingStatus: {
			type: 'saved_item_parsing_status',
			notNull: true,
			default: 'PROCESSING',
		},
	});

	// Update items that are clearly failed
	pgm.sql(`
		UPDATE saved_item 
		SET "parsingStatus" = 'FAILED' 
		WHERE title LIKE 'Failed to process: %';
	`);

	// Update items that are clearly NOT processing (those that don't have the processing title patterns)
	pgm.sql(`
		UPDATE saved_item 
		SET "parsingStatus" = 'PARSED' 
		WHERE NOT (title LIKE 'Processing item %' OR title = 'Processing newsletter%')
		AND NOT (title LIKE 'Failed to process: %');
	`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.dropColumn('saved_item', 'parsingStatus');
	pgm.dropType('saved_item_parsing_status');
}
