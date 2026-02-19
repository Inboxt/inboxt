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
		expiresIn: z
			.string()
			.regex(
				/^\d+[smhd]$/,
				'JWT expiresIn must be a valid duration (e.g., "30d", "24h", "60m", "3600s")',
			)
			.default('30d'),
		requireEmailVerification: z.boolean().default(false),
		disableSignup: z.boolean().default(false),
	}),
	errors: z
		.object({
			apiDsn: z.url().optional(),
			webDsn: z.url().optional(),
		})
		.optional(),
	inboundEmailAddressDomain: z.string().optional(),
	appUrl: z.url().default('http://localhost:7000'),
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
	storage: z
		.object({
			bucket: z.string().optional(),
			region: z.string().optional(),
			endpoint: z.string().optional(),
			accessKeyId: z.string().optional(),
			secretAccessKey: z.string().optional(),
		})
		.optional(),
	exports: z.object({
		localPath: z.string().default('exports'),
	}),
	mail: z
		.object({
			host: z.string().min(1, 'MAIL_HOST is required'),
			port: z
				.preprocess(
					(val) => (typeof val === 'string' ? parseInt(val, 10) : val),
					z.number(),
				)
				.refine(
					(n) => Number.isInteger(n) && n > 0,
					'MAIL_PORT must be a positive integer',
				),
			secure: z.boolean().optional(),
			auth: z
				.object({
					user: z.string(),
					pass: z.string(),
				})
				.optional(),
		})
		.optional(),
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
			graphiql: process.env.NODE_ENV !== 'production',
		},
		security: {
			jwtSecret: process.env.API_JWT_SECRET,
			expiresIn: process.env.API_JWT_EXPIRES_IN,
			requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
			disableSignup: process.env.DISABLE_SIGNUP === 'true',
		},
		errors:
			process.env.API_ERRORS_DSN || process.env.WEB_ERRORS_DSN
				? {
						apiDsn: process.env.API_ERRORS_DSN,
						webDsn: process.env.WEB_ERRORS_DSN,
					}
				: undefined,
		inboundEmailAddressDomain: process.env.INBOUND_EMAIL_ADDRESS_DOMAIN,
		appUrl: process.env.APP_URL || process.env.API_URL,
		valkey: {
			connection: {
				host: process.env.VALKEY_HOST,
				port: process.env.VALKEY_PORT,
			},
		},
		storage: process.env.STORAGE_S3_BUCKET
			? {
					bucket: process.env.STORAGE_S3_BUCKET,
					region: process.env.STORAGE_S3_REGION,
					endpoint: process.env.STORAGE_S3_ENDPOINT,
					accessKeyId: process.env.STORAGE_S3_ACCESS_KEY,
					secretAccessKey: process.env.STORAGE_S3_SECRET_KEY,
				}
			: undefined,
		exports: {
			localPath: process.env.EXPORTS_LOCAL_PATH,
		},
		mail: process.env.MAIL_HOST
			? {
					host: process.env.MAIL_HOST,
					port: process.env.MAIL_PORT,
					secure: process.env.MAIL_SECURE === 'true' ? true : undefined,
					auth:
						process.env.MAIL_USER && process.env.MAIL_PASSWORD
							? {
									user: process.env.MAIL_USER,
									pass: process.env.MAIL_PASSWORD,
								}
							: undefined,
				}
			: undefined,
	});
};
