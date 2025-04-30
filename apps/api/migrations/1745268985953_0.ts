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
		logins: { type: 'integer', notNull: true, default: 0 },
		lastLogin: 'timestamp',
		emailAddress: { type: 'text', notNull: true, unique: true },
		password: 'text',
		username: 'text',
		isEmailVerified: { type: 'boolean', notNull: true, default: false },
		emailVerifyCode: 'text',
		emailVerifyExpiry: 'timestamp',
		resetPasswordCode: 'text',
		resetPasswordExpiry: 'timestamp',
	});
}

export async function down(pgm: MigrationBuilder): Promise<void> {}
