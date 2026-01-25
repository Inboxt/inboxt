import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { PrismaClient, Prisma } from '@inboxt/prisma';

@Injectable()
export class PrismaService
	extends PrismaClient<Prisma.PrismaClientOptions, 'warn' | 'error'>
	implements OnModuleInit, OnModuleDestroy
{
	constructor(private readonly logger: PinoLogger) {
		super({
			log: [
				{ level: 'warn', emit: 'event' },
				{ level: 'error', emit: 'event' },
			],
		});

		this.logger.setContext('Prisma');

		this.$on('warn', (e) => this.logger.warn(e, 'Prisma warn'));
		this.$on('error', (e) => this.logger.error(e, 'Prisma error'));
	}

	async onModuleInit() {
		await this.$connect();
	}

	async onModuleDestroy() {
		await this.$disconnect();
	}
}
