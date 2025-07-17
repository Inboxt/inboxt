import { hash } from 'argon2';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({
	path: join(__dirname, '../../../.env'),
});

import { PrismaClient } from '../prisma/client';
import { UserPlan } from './enums/user-plan.enum';

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
		  WHERE schemaname = 'public' AND tablename != '_prisma_migrations') 
		|| ' RESTART IDENTITY CASCADE';
	  END $$;
	`;
	logSuccess('Database reset');
}

async function seedUsers() {
	logStep('Seeding users...');

	// Demo account
	const demoAccountData = {
		emailAddress: 'demo@inbox-reader.com',
		password: await hash('Password1@'),
		isEmailVerified: true,
		username: 'demo',
		plan: UserPlan.DEMO,
	};

	const demo = await prisma.user.create({
		data: demoAccountData,
	});

	logSuccess('Users seeded');
	return { demo };
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
			name: 'Long label just for fun and testing purposes',
			color: '#141414',
			userId,
		},
	];

	await prisma.label.createMany({
		data: labels,
	});

	logSuccess('Labels seeded');
}

async function seed() {
	logSection('🌱 Seeding started...');

	await resetDatabase();
	const users = await seedUsers();
	await seedLabels(users.demo.id);

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
