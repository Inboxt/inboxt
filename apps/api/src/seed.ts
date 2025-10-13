import { hash } from 'argon2';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({
	path: join(__dirname, '../../../.env'),
});

import { PrismaClient } from '../prisma/client';
import { UserPlan } from './enums/user-plan.enum';
import { SavedItemType } from './enums/saved-item-type.enum';

const prisma = new PrismaClient();

const logStep = (message: string, newline = true) => {
	if (newline) console.log('');
	console.log('\x1b[33m%s\x1b[0m', `🚧 ${message}`);
};

const logSuccess = (message: string, newline = false) => {
	if (newline) console.log('');
	console.log('\x1b[32m%s\x1b[0m', `✅ ${message}`);
};

const logSection = (message: string) => {
	console.log('');
	console.log('\x1b[36m%s\x1b[0m', message);
	console.log('');
};

async function resetDatabase() {
	logStep('Resetting database...', false);
	await prisma.$executeRaw`
	  DO $$ DECLARE
		r RECORD;
	  BEGIN
		EXECUTE 'TRUNCATE TABLE ' || 
		(SELECT string_agg(format('%I.%I', schemaname, tablename), ', ')
		  FROM pg_tables
		  WHERE schemaname = 'public' AND tablename != 'pgmigrations') 
		|| ' RESTART IDENTITY CASCADE';
	  END $$;
	`;
	logSuccess('Database reset');
}

async function seedUsers() {
	logStep('Seeding users...');

	// Demo account
	const demoAccountData = {
		emailAddress: 'demo@inboxt.app',
		password: await hash('Password1@'),
		isEmailVerified: true,
		username: 'demo',
		plan: UserPlan.DEMO,
	};

	const demo = await prisma.user.create({
		data: demoAccountData,
	});

	const freeAccountData = {
		emailAddress: 'free@inboxt.app',
		password: await hash('Password1@'),
		isEmailVerified: false,
		username: 'free',
		plan: UserPlan.FREE,
	};

	const free = await prisma.user.create({
		data: freeAccountData,
	});

	logSuccess('Users seeded');
	return { demo, free };
}

async function seedLabels(userId: string) {
	logStep('Seeding labels...');
	const labels = [
		{
			name: 'News',
			color: '#f03e3e',
			userId,
		},
		{
			name: 'Tech',
			color: '#4263eb',
			userId,
		},
		{
			name: 'Hobby',
			color: '#f59f00',
			userId,
		},
		{
			name: 'Long label just for fun on max',
			color: '#141414',
			userId,
		},
		...Array.from({ length: 45 }).map((_, i) => ({
			name: `BulkLabel${i + 1}`,
			color: '#999999',
			userId,
		})),
	];

	await prisma.label.createMany({
		data: labels,
	});

	logSuccess('Labels seeded');
}

async function seedSavedItems(userId: string) {
	logStep('Seeding saved items...');

	const count = Math.floor(Math.random() * 51) + 50;
	const now = Date.now();

	const items = Array.from({ length: count }).map((_, idx) => {
		const createdAt = new Date(now - idx * 60_000);
		return {
			userId,
			title: `Demo Article #${String(idx + 1)}`,
			originalUrl: `https://example.com/demo-article-${String(idx + 1)}`,
			type: SavedItemType.ARTICLE,
			createdAt,
			wordCount: 100,
			description: `This is a demo article. It's number ${String(idx + 1)}.`,
		};
	});

	await prisma.saved_item.createMany({
		data: items,
		skipDuplicates: true,
	});

	logSuccess(`Saved ${count} items`);
}

async function seed() {
	logSection('🌱 Seeding started...');

	await resetDatabase();
	const users = await seedUsers();

	await seedLabels(users.demo.id);
	await seedSavedItems(users.demo.id);

	await seedLabels(users.free.id);
	await seedSavedItems(users.free.id);

	logSection('🎉 Seeding complete!');
}

seed()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
