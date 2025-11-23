import { z } from 'zod';

export const configSchema = z.object({
	cors: z.object({
		enabled: z.boolean().default(true),
	}),
	graphql: z.object({
		autoSchemaFile: z.boolean().default(true),
		sortSchema: z.boolean().default(true),
		graphiql: z.boolean().default(true),
	}),
	security: z.object({
		jwtSecret: z.string().min(1, 'API_JWT_SECRET is required'),
		expiresIn: z.string().min(1, 'JWT expiresIn is required'),
	}),
	valkey: z.object({
		connection: z.object({
			host: z.string().min(1, 'VALKEY_HOST is required'),
			port: z
				.preprocess(
					(val) => (typeof val === 'string' ? parseInt(val, 10) : val),
					z.number(),
				)
				.refine(
					(n) => Number.isInteger(n) && n > 0,
					'VALKEY_PORT must be a positive integer',
				),
		}),
	}),
	storage: z.object({
		bucket: z.string().min(1, 'STORAGE_S3_BUCKET is required'),
		region: z.string().min(1, 'STORAGE_S3_REGION is required'),
		endpoint: z.string().min(1, 'STORAGE_S3_ENDPOINT is required'),
		accessKeyId: z.string().min(1, 'STORAGE_S3_ACCESS_KEY is required'),
		secretAccessKey: z.string().min(1, 'STORAGE_S3_SECRET_KEY is required'),
	}),
});

export type Config = z.infer<typeof configSchema>;

export const config = (): Config => {
	return configSchema.parse({
		cors: {
			enabled: true,
		},
		graphql: {
			autoSchemaFile: true,
			sortSchema: true,
			graphiql: true,
		},
		security: {
			jwtSecret: process.env.API_JWT_SECRET,
			expiresIn: process.env.API_JWT_EXPIRES_IN || '1d',
		},
		valkey: {
			connection: {
				host: process.env.VALKEY_HOST,
				port: process.env.VALKEY_PORT,
			},
		},
		storage: {
			bucket: process.env.STORAGE_S3_BUCKET,
			region: process.env.STORAGE_S3_REGION,
			endpoint: process.env.STORAGE_S3_ENDPOINT,
			accessKeyId: process.env.STORAGE_S3_ACCESS_KEY,
			secretAccessKey: process.env.STORAGE_S3_SECRET_KEY,
		},
	});
};
