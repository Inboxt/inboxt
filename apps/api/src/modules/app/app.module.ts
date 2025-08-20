import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule as NestBullModule } from '@nestjs/bullmq';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from '../../services/prisma.service';
import { UserModule } from '../user/user.module';
import { GqlAuthGuard } from '../../guards/auth.guard';
import { AuthModule } from '../auth/auth.module';
import { ActiveUserModule } from '../active-user/active-user.module';
import { MailModule } from '../mail/mail.module';
import { GlobalExceptionFilter } from '../../exception-filters/global-exception.filter';
import { config } from '../../config/config';
import { GraphqlConfig, ValkeyConfig } from '../../config/config.interface';
import { SavedItemModule } from '../saved-item/saved-item.module';
import { InboundEmailAddressModule } from '../inbound-email-address/inbound-email-address.module';
import { SavedItemManagerModule } from '../../managers/saved-item-manager/saved-item-manager.module';
import { ScheduleTasksModule } from '../schedule/schedule-tasks.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [config],
			envFilePath: ['../../.env'],
		}),
		GraphQLModule.forRootAsync({
			driver: ApolloDriver,
			useFactory: async (configService: ConfigService) => {
				const graphqlConfig = configService.get<GraphqlConfig>('graphql');

				return {
					autoSchemaFile: graphqlConfig!.autoSchemaFile,
					sortSchema: graphqlConfig!.sortSchema,
					graphiql: graphqlConfig!.graphiql,
					context: ({ req, res }) => ({ req, res }),
					cors: {
						credentials: true,
						origin: true,
					},
				};
			},
			inject: [ConfigService],
		}),
		MailerModule.forRoot({
			transport: {
				host: process.env.MAIL_HOST,
				port: parseInt(process.env.MAIL_PORT as string, 10),
			},
		}),
		NestBullModule.forRootAsync({
			useFactory: (configService: ConfigService) => {
				const valkeyConfig = configService.get<ValkeyConfig>('valkey');
				return {
					connection: valkeyConfig!.connection,
				};
			},
			inject: [ConfigService],
		}),
		ScheduleModule.forRoot(),
		UserModule,
		AuthModule,
		ActiveUserModule,
		MailModule,
		ScheduleTasksModule,
		SavedItemModule,
		InboundEmailAddressModule,
		SavedItemManagerModule,
	],
	providers: [
		PrismaService,
		AppService,
		{
			provide: APP_GUARD,
			useClass: GqlAuthGuard,
		},
		{
			provide: APP_FILTER,
			useClass: GlobalExceptionFilter,
		},
	],
	controllers: [AppController],
})
export class AppModule {}
