import path from 'node:path';
import { defineConfig } from 'wxt';

export default defineConfig({
	srcDir: 'src',
	outDir: 'dist',
	modules: ['@wxt-dev/module-react', '@wxt-dev/auto-icons'],

	vite: () => ({
		envDir: path.resolve(__dirname, '../../'),
	}),

	dev: {
		server: {
			port: 3001,
		},
	},

	manifest: {
		permissions: ['tabs', 'storage'],
		host_permissions: ['<all_urls>'],
	},

	autoIcons: {
		developmentIndicator: false,
	},
});
