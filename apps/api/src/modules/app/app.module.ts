import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BullModule as NestBullModule } from '@nestjs/bullmq';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { LoggerModule } from 'nestjs-pino';
import { join } from 'path';

import { GlobalExceptionFilter } from '~common/exception-filters/global-exception.filter';
import { AccountGuard } from '~common/guards/account.guard';
import { ApiTokenGuard } from '~common/guards/api-token.guard';
import { GqlAuthGuard } from '~common/guards/auth.guard';
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
import { GqlRateLimitGuard } from '~modules/rate-limit/rate-limit.guard';
import { RateLimitModule } from '~modules/rate-limit/rate-limit.module';
import { SavedItemModule } from '~modules/saved-item/saved-item.module';
import { SavedQueryModule } from '~modules/saved-query/saved-query.module';
import { ScheduleTasksModule } from '~modules/schedule/schedule-tasks.module';
import { UserModule } from '~modules/user/user.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: join(process.cwd(), 'public'),
			exclude: ['/api/*path'],
		}),
		ConfigModule.forRoot({
			isGlobal: true,
			load: [config],
			envFilePath: ['../../.env'],
		}),
		LoggerModule.forRootAsync({
			useFactory: (configService: ConfigService<Config>) => {
				const loggingConfig = configService.getOrThrow('logging', { infer: true });
				return {
					pinoHttp: {
						level: loggingConfig.level,
						autoLogging: loggingConfig.autoLogging
							? {
									ignore: (req) =>
										req.headers['user-agent']?.includes('Wget') ||
										req.url === '/health' ||
										!req.url?.startsWith('/api'),
								}
							: false,
						customLogLevel: (_req, res, err) => {
							if (err || (res.statusCode && res.statusCode >= 500)) {
								return 'error';
							}
							if (res.statusCode && res.statusCode >= 400) {
								return 'warn';
							}
							return 'debug';
						},
						serializers: {
							req: (req) => ({
								id: req.id,
								method: req.method,
								url: req.url,
								query: req.query,
								remoteAddress: req.remoteAddress || req.socket?.remoteAddress,
								remotePort: req.remotePort || req.socket?.remotePort,
								headers: req.headers,
							}),
							res: (res) => ({
								statusCode: res.statusCode,
								headers: res.getHeaders?.(),
							}),
						},
						formatters: {
							level: (label) => {
								return { level: label.toUpperCase() };
							},
						},
						transport:
							process.env.NODE_ENV !== 'production'
								? {
										target: 'pino-pretty',
										options: {
											singleLine: true,
											colorize: true,
										},
									}
								: undefined,
						redact: [
							'req.headers.authorization',
							'req.headers.cookie',
							'res.headers["set-cookie"]',
						],
						customProps: (req) => ({
							userId: (req as any).user?.id,
						}),
						messageKey: 'message',
					},
					forRoutes: [{ method: RequestMethod.ALL, path: '*splat' }],
				};
			},
			inject: [ConfigService],
		}),
		GraphQLModule.forRootAsync<ApolloDriverConfig>({
			driver: ApolloDriver,
			useFactory: (configService: ConfigService<Config>) => {
				const graphqlConfig = configService.getOrThrow('graphql', { infer: true });
				return {
					path: '/api/graphql',
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
		RateLimitModule,
		UserModule,
		AuthModule,
		ActiveUserModule,
		MailModule,
		ScheduleTasksModule,
		SavedItemModule,
		SavedQueryModule,
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
		consumer.apply(RequestIdMiddleware).forRoutes('*path');
	}
}
