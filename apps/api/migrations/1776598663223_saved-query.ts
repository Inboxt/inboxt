import type { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.createTable('saved_query', {
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
		name: { type: 'text', notNull: true },
		query: { type: 'text', notNull: true },
	});

	pgm.createIndex('saved_query', 'userId');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.dropIndex('saved_query', 'userId');

	pgm.dropTable('saved_query');
}
