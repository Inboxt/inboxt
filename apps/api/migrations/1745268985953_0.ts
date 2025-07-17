import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.createExtension('pgcrypto', { ifNotExists: true });

	pgm.createType('saved_item_type', ['NEWSLETTER', 'ARTICLE']);
	pgm.createType('user_plan', ['DEMO', 'FREE']);
	pgm.createType('saved_item_status', ['ACTIVE', 'ARCHIVED', 'DELETED']);

	pgm.createTable('user', {
		id: {
			type: 'uuid',
			primaryKey: true,
			notNull: true,
			default: pgm.func('gen_random_uuid()'),
		},
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

	pgm.createTable('saved_item', {
		id: {
			type: 'uuid',
			primaryKey: true,
			notNull: true,
			default: pgm.func('gen_random_uuid()'),
		},
		createdAt: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('current_timestamp'),
		},
		userId: {
			type: 'uuid',
			notNull: true,
			references: 'user',
			onDelete: 'CASCADE',
		},
		title: { type: 'text', notNull: true },
		originalUrl: 'text',
		sourceDomain: 'text',
		description: 'text',
		leadImage: 'text',
		wordCount: 'integer',
		author: 'text',
		type: {
			type: 'saved_item_type',
			notNull: true,
		},
		status: {
			type: 'saved_item_status',
			notNull: true,
			default: 'ACTIVE',
		},
	});

	pgm.createIndex('saved_item', 'userId');

	pgm.createTable('article', {
		savedItemId: {
			type: 'uuid',
			primaryKey: true,
			references: 'saved_item',
			onDelete: 'CASCADE',
		},
		contentHtml: { type: 'text', notNull: true },
		contentText: { type: 'text', notNull: true },
	});

	pgm.createTable('label', {
		id: {
			type: 'uuid',
			primaryKey: true,
			notNull: true,
			default: pgm.func('gen_random_uuid()'),
		},
		createdAt: {
			type: 'timestamp',
			notNull: true,
			default: pgm.func('current_timestamp'),
		},
		userId: {
			type: 'uuid',
			notNull: true,
			references: 'user',
			onDelete: 'CASCADE',
		},
		name: { type: 'text', notNull: true },
		color: 'text',
	});

	pgm.createIndex('label', ['userId', 'name'], { unique: true });

	pgm.createTable('saved_item_label', {
		id: {
			type: 'uuid',
			primaryKey: true,
			notNull: true,
			default: pgm.func('gen_random_uuid()'),
		},
		savedItemId: {
			type: 'uuid',
			notNull: true,
			references: 'saved_item',
			onDelete: 'CASCADE',
		},
		labelId: {
			type: 'uuid',
			notNull: true,
			references: 'label',
			onDelete: 'CASCADE',
		},
	});
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	pgm.dropType('saved_item_type');
	pgm.dropType('user_plan');
	pgm.dropType('saved_item_status');

	pgm.dropIndex('saved_item', 'user_id');
	pgm.dropIndex('saved_item_label', ['labelId', 'savedItemId']);

	pgm.dropTable('user');
	pgm.dropTable('saved_item');
	pgm.dropTable('article');
	pgm.dropTable('saved_item_label');
	pgm.dropTable('label');
}
