import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaService } from '../../services/prisma.service';
import { UserModule } from '../user/user.module';

@Module({
	imports: [
		GraphQLModule.forRoot({
			driver: ApolloDriver,
			autoSchemaFile: true,
			sortSchema: true,
			graphiql: true,
		}),
		UserModule,
	],
	providers: [PrismaService, AppService],
	controllers: [AppController],
})
export class AppModule {}
