import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BullModule as NestBullModule } from '@nestjs/bullmq';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';

import { GlobalExceptionFilter } from '~common/exception-filters/global-exception.filter';
import { AccountGuard } from '~common/guards/account.guard';
import { ApiTokenGuard } from '~common/guards/api-token.guard';
import { GqlAuthGuard } from '~common/guards/auth.guard';
import { GqlRateLimitGuard } from '~common/guards/rate-limit.guard';
import { RequestIdMiddleware } from '~common/middleware/request-id.middleware';
import { config, type Config } from '~config/index';
import { EntryManagerModule } from '~managers/entry-manager/entry-manager.module';
import { SavedItemManagerModule } from '~managers/saved-item-manager/saved-item-manager.module';
import { ActiveUserModule } from '~modules/active-user/active-user.module';
import { ApiTokenModule } from '~modules/api-token/api-token.module';
import { AuthModule } from '~modules/auth/auth.module';
import { ExportModule } from '~modules/export/export.module';
import { HighlightModule } from '~modules/highlight/highlight.module';
import { ImportModule } from '~modules/import/import.module';
import { InboundEmailAddressModule } from '~modules/inbound-email-address/inbound-email-address.module';
import { MailModule } from '~modules/mail/mail.module';
import { PrismaModule } from '~modules/prisma/prisma.module';
import { SavedItemModule } from '~modules/saved-item/saved-item.module';
import { ScheduleTasksModule } from '~modules/schedule/schedule-tasks.module';
import { UserModule } from '~modules/user/user.module';
import { RateLimitService } from '~services/rate-limit.service';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [config],
			envFilePath: ['../../.env'],
		}),
		LoggerModule.forRoot({
			pinoHttp: {
				level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
				autoLogging: {
					ignore: (req) =>
						req.headers['user-agent']?.includes('Wget') || req.url === '/health',
				},
				formatters: {
					level: (label) => {
						return { level: label.toUpperCase() };
					},
				},
				transport:
					process.env.NODE_ENV !== 'production'
						? { target: 'pino-pretty', options: { singleLine: true, colorize: true } }
						: undefined,
				redact: ['req.headers.authorization', 'req.headers.cookie'],
				customProps: (req) => ({
					userId: (req as any).user?.id,
				}),
				messageKey: 'message',
			},
		}),
		GraphQLModule.forRootAsync<ApolloDriverConfig>({
			driver: ApolloDriver,
			useFactory: (configService: ConfigService<Config>) => {
				const graphqlConfig = configService.getOrThrow('graphql', { infer: true });
				return {
					autoSchemaFile: graphqlConfig.autoSchemaFile,
					sortSchema: graphqlConfig.sortSchema,
					graphiql: graphqlConfig.graphiql,
					context: (ctx: { req: Request; res: Response }) => ctx,
					cors: {
						credentials: true,
						origin: true,
					},
				};
			},
			inject: [ConfigService],
		}),
		NestBullModule.forRootAsync({
			useFactory: (configService: ConfigService) => {
				const valkeyConfig = configService.getOrThrow('valkey', { infer: true });
				return {
					connection: valkeyConfig.connection,
				};
			},
			inject: [ConfigService],
		}),
		ScheduleModule.forRoot(),
		PrismaModule,
		UserModule,
		AuthModule,
		ActiveUserModule,
		MailModule,
		ScheduleTasksModule,
		SavedItemModule,
		InboundEmailAddressModule,
		SavedItemManagerModule,
		HighlightModule,
		EntryManagerModule,
		ExportModule,
		ImportModule,
		ApiTokenModule,
	],
	providers: [
		AppService,
		RateLimitService,
		{ provide: APP_GUARD, useClass: ApiTokenGuard },
		{ provide: APP_GUARD, useClass: GqlAuthGuard },
		{ provide: APP_GUARD, useClass: GqlRateLimitGuard },
		{ provide: APP_GUARD, useClass: AccountGuard },
		{
			provide: APP_FILTER,
			useClass: GlobalExceptionFilter,
		},
	],
	controllers: [AppController],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(RequestIdMiddleware).forRoutes('*');
	}
}
