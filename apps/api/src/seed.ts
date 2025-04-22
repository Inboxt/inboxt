import { PrismaClient } from '../prisma/client';

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
	console.log('\x1b[36m%s\x1b[0m', message); // Cyan header
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
	await prisma.user.create({
		data: {},
	});
	logSuccess('Users seeded');
}

async function seed() {
	logSection('🌱 Seeding started...');

	await resetDatabase();
	await seedUsers();

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
