import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.createTable('user_reading_log', {
		id: {
			type: 'uuid',
			primaryKey: true,
			notNull: true,
			default: pgm.func('gen_random_uuid()'),
		},
		createdAt: {
			type: 'timestamptz',
			notNull: true,
			default: pgm.func('now()'),
		},
		userId: {
			type: 'uuid',
			notNull: true,
			references: 'user',
			onDelete: 'CASCADE',
		},
		savedItemId: {
			type: 'uuid',
			references: 'saved_item',
			onDelete: 'SET NULL',
		},
		wordCount: {
			type: 'integer',
			notNull: true,
			default: 0,
		},
		savedItemCreatedAt: {
			type: 'timestamptz',
			notNull: true,
		},
		readAt: {
			type: 'timestamptz',
			notNull: true,
		},
	});

	pgm.createIndex('user_reading_log', 'userId');
	pgm.createIndex('user_reading_log', 'savedItemId');
	pgm.createIndex('user_reading_log', 'readAt');

	pgm.sql(`
		INSERT INTO "user_reading_log" ("id", "userId", "savedItemId", "wordCount", "savedItemCreatedAt", "readAt", "createdAt")
		SELECT gen_random_uuid(), "userId", "id", COALESCE("wordCount", 0), "createdAt", "readAt", NOW()
		FROM "saved_item"
		WHERE "readAt" IS NOT NULL;
	`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.dropTable('user_reading_log');
}
