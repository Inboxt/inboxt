import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.createTable('user', {
		id: 'id',
		createdAt: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('current_timestamp'),
		},
	});
}

export async function down(pgm: MigrationBuilder): Promise<void> {}
