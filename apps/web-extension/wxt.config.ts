import { defineConfig } from 'wxt';
import path from 'node:path';

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
		permissions: ['tabs'],
		host_permissions: ['http://localhost:7000/', 'http://192.168.1.19:7000/'],
	},

	autoIcons: {
		developmentIndicator: false,
	},
});
