import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.createType('inbox_item_type', ['NEWSLETTER', 'ARTICLE']);
	pgm.createType('user_plan', ['DEMO', 'FREE']);

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
		pendingEmailAddress: 'text',
		password: 'text',
		username: 'text',
		isEmailVerified: { type: 'boolean', notNull: true, default: false },
		emailVerifyCode: 'text',
		emailVerifyExpiry: 'timestamp',
		resetPasswordCode: 'text',
		resetPasswordExpiry: 'timestamp',
		plan: { type: 'user_plan', notNull: true, default: 'FREE' },
	});

	pgm.createTable('inbox_item', {
		id: 'id',
		createdAt: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('current_timestamp'),
		},
		userId: {
			type: 'integer',
			notNull: true,
			references: 'user',
			onDelete: 'CASCADE',
		},
		originalUrl: 'text',
		type: {
			type: 'inbox_item_type',
			notNull: true,
		},
	});
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.dropType('inbox_item_type');
	pgm.dropType('user_plan');

	pgm.dropTable('user');
	pgm.dropTable('inbox-item');
}
