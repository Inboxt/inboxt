import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['src/**/*.ts'],
			exclude: [
				'src/**/*.spec.ts',
				'src/main.ts',
				'src/seed.ts',
				'src/**/*.module.ts',
				'src/**/*.dto.ts',
				'src/**/*.input.ts',
				'src/**/*.connection.ts',
				'src/**/*.model.ts',
				'src/**/*.resolver.ts',
				'src/**/*.controller.ts',
				'src/**/*.guard.ts',
				'src/**/*.decorator.ts',
				'src/**/*.middleware.ts',
				'src/**/*.filter.ts',
				'src/mail-templates/**',
			],
		},
	},
	resolve: {
		alias: {
			'~common': resolve(__dirname, './src/common'),
			'~config': resolve(__dirname, './src/config'),
			'~managers': resolve(__dirname, './src/managers'),
			'~modules': resolve(__dirname, './src/modules'),
			'~services': resolve(__dirname, './src/services'),
			'~mail-templates': resolve(__dirname, './src/mail-templates'),
			'@inboxt/common': resolve(__dirname, '../../libs/common/src'),
			'@inboxt/prisma': resolve(__dirname, './prisma/client'),
		},
	},
});
