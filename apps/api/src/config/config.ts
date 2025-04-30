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
});
