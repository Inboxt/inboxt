import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
	pgm.createExtension('pgcrypto', { ifNotExists: true });

	pgm.createType('saved_item_type', ['NEWSLETTER', 'ARTICLE']);
	pgm.createType('user_plan', ['DEMO', 'FREE']);
	pgm.createType('saved_item_status', ['ACTIVE', 'ARCHIVED', 'DELETED']);
	pgm.createType('newsletter_subscription_status', ['ACTIVE', 'UNSUBSCRIBED']);

	pgm.createTable('user', {
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
		logins: { type: 'integer', notNull: true, default: 0 },
		lastLogin: 'timestamptz',
		emailAddress: { type: 'text', notNull: true, unique: true },
		pendingEmailAddress: 'text',
		password: 'text',
		username: 'text',
		isEmailVerified: { type: 'boolean', notNull: true, default: false },
		emailVerifyCode: 'text',
		emailVerifyExpiry: 'timestamptz',
		resetPasswordCode: 'text',
		resetPasswordExpiry: 'timestamptz',
		plan: { type: 'user_plan', notNull: true, default: 'FREE' },
		lastExportAt: 'timestamptz',
		storageUsageBytes: { type: 'bigint', notNull: true, default: 0 },
		storageQuotaBytes: { type: 'bigint', notNull: true, default: 104_857_600 },
		lastNotifiedStorageThreshold: { type: 'integer', notNull: true, default: 0 },
	});

	pgm.createTable('saved_item', {
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
		deletedSince: 'timestamptz',
		sizeBytes: { type: 'bigint', notNull: true, default: 0 },
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
		sizeBytes: { type: 'bigint', notNull: true, default: 0 },
	});

	pgm.createTable('label', {
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

	pgm.createIndex('saved_item_label', ['savedItemId', 'labelId'], { unique: true });

	pgm.createTable('inbound_email_address', {
		id: {
			type: 'uuid',
			primaryKey: true,
			notNull: true,
			default: pgm.func('gen_random_uuid()'),
		},
		userId: {
			type: 'uuid',
			notNull: false,
			references: 'user',
			onDelete: 'SET NULL',
		},
		createdAt: {
			type: 'timestamptz',
			notNull: true,
			default: pgm.func('now()'),
		},
		deletedAt: 'timestamptz',
		localPart: { type: 'varchar(64)', notNull: true },
		fullAddress: { type: 'text', notNull: true, unique: true },
	});

	pgm.addConstraint('inbound_email_address', 'inbound_email_address_user_local_part_unique', {
		unique: ['userId', 'localPart'],
	});

	pgm.createTable('newsletter_subscription', {
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
		status: {
			type: 'newsletter_subscription_status',
			notNull: true,
			default: 'ACTIVE',
		},
		name: { type: 'text', notNull: true },
		lastReceivedAt: 'timestamptz',
		unsubscribeUrl: 'text',
		unsubscribeAttemptedAt: { type: 'timestamptz' },
		inboundEmailAddressId: {
			type: 'uuid',
			notNull: true,
			references: 'inbound_email_address',
			onDelete: 'CASCADE',
		},
	});

	pgm.createIndex('newsletter_subscription', 'inboundEmailAddressId');

	pgm.createTable('newsletter', {
		savedItemId: {
			type: 'uuid',
			primaryKey: true,
			references: 'saved_item',
			onDelete: 'CASCADE',
		},
		inboundEmailAddressId: {
			type: 'uuid',
			notNull: false,
			references: 'inbound_email_address',
			onDelete: 'SET NULL',
		},
		contentHtml: { type: 'text', notNull: true },
		contentText: { type: 'text', notNull: true },
		messageId: 'text',
		eventId: 'text',
		subscriptionId: {
			type: 'uuid',
			notNull: false,
			references: 'newsletter_subscription',
			onDelete: 'SET NULL',
		},
		sizeBytes: { type: 'bigint', notNull: true, default: 0 },
	});

	pgm.createIndex('newsletter', 'messageId');
	pgm.createIndex('newsletter', 'eventId');
	pgm.createIndex('newsletter', 'subscriptionId');
	pgm.createIndex('newsletter', 'inboundEmailAddressId');

	pgm.createTable('highlight', {
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
		savedItemId: {
			type: 'uuid',
			notNull: false,
			references: 'saved_item',
			onDelete: 'SET NULL',
		},
		userId: {
			type: 'uuid',
			notNull: true,
			references: 'user',
			onDelete: 'CASCADE',
		},
	});

	pgm.createIndex('highlight', 'userId');
	pgm.createIndex('highlight', 'savedItemId');

	pgm.createTable('highlight_segment', {
		id: {
			type: 'uuid',
			primaryKey: true,
			notNull: true,
			default: pgm.func('gen_random_uuid()'),
		},
		highlightId: {
			type: 'uuid',
			notNull: true,
			references: 'highlight',
			onDelete: 'CASCADE',
		},
		xpath: { type: 'text', notNull: true },
		beforeText: { type: 'text', notNull: true },
		startOffset: { type: 'integer', notNull: true },
		endOffset: { type: 'integer', notNull: true },
		afterText: { type: 'text', notNull: true },
		text: 'text',
		sizeBytes: { type: 'bigint', notNull: true, default: 0 },
	});

	pgm.createIndex('highlight_segment', 'highlightId');

	pgm.createTable('api_token', {
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
		lastUsedAt: 'timestamptz',
		name: { type: 'text', notNull: true },
		token: 'text',
		userId: {
			type: 'uuid',
			notNull: true,
			references: 'user',
			onDelete: 'CASCADE',
		},
		expiresAt: 'timestamptz',
	});

	pgm.createIndex('api_token', 'userId');
	pgm.createIndex('api_token', 'token', { unique: true });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
	// Drop indexes
	pgm.dropIndex('saved_item', 'userId');
	pgm.dropIndex('saved_item_label', ['savedItemId', 'labelId'], { unique: true });
	pgm.dropIndex('label', ['userId', 'name'], { unique: true });
	pgm.dropIndex('newsletter_subscription', 'inboundEmailAddressId');
	pgm.dropIndex('newsletter', 'messageId');
	pgm.dropIndex('newsletter', 'eventId');
	pgm.dropIndex('newsletter', 'subscriptionId');
	pgm.dropIndex('newsletter', 'inboundEmailAddressId');
	pgm.dropIndex('highlight', 'userId');
	pgm.dropIndex('highlight', 'savedItemId');
	pgm.dropIndex('highlight_segment', 'highlightId');
	pgm.dropIndex('api_token', 'userId');
	pgm.dropIndex('api_token', 'token', { unique: true });

	// Drop tables
	pgm.dropTable('newsletter');
	pgm.dropTable('newsletter_subscription');
	pgm.dropTable('inbound_email_address');
	pgm.dropTable('saved_item_label');
	pgm.dropTable('article');
	pgm.dropTable('label');
	pgm.dropTable('saved_item');
	pgm.dropTable('user');
	pgm.dropTable('highlight_segment');
	pgm.dropTable('highlight');
	pgm.dropTable('api_token');

	// Drop custom types
	pgm.dropType('newsletter_subscription_status');
	pgm.dropType('saved_item_status');
	pgm.dropType('user_plan');
	pgm.dropType('saved_item_type');

	// Drop extensions
	pgm.dropExtension('pgcrypto');
}
