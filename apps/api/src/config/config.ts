import { Config } from './config.interface';

export const config = (): Config => ({
	cors: {
		enabled: true,
	},
	graphql: {
		autoSchemaFile: true,
		sortSchema: true,
		graphiql: true,
	},
	security: {
		jwtSecret: process.env.API_JWT_SECRET as string,
		expiresIn: '1d',
	},
	valkey: {
		connection: {
			host: process.env.VALKEY_HOST as string,
			port: parseInt(process.env.VALKEY_PORT as string, 10),
		},
	},
});
