import { defineConfig } from 'wxt';

export default defineConfig({
	srcDir: 'src',
	outDir: 'dist',
	modules: ['@wxt-dev/module-react', '@wxt-dev/auto-icons'],

	dev: {
		server: {
			port: 3001,
		},
	},

	manifest: {
		name: 'Inboxt',
		permissions: ['tabs', 'storage', 'activeTab'],
		host_permissions: ['<all_urls>'],
		homepage_url: 'https://inboxt.app',
		browser_specific_settings: {
			gecko: {
				id: 'inboxt@inboxt.app',
				// @ts-expect-error - not supported by WXT yet
				data_collection_permissions: {
					required: ['websiteContent', 'browsingActivity', 'authenticationInfo'],
				},
			},
		},
	},

	autoIcons: {
		developmentIndicator: false,
	},
	zip: {
		sourcesRoot: '../..',
		includeSources: [
			'package.json',
			'tsconfig.base.json',
			'apps/web-extension/README.md',
			'libs/common/README.md',
			'libs/ui/README.md',
			'libs/common/tsconfig.json',
		],
		excludeSources: [
			'**/node_modules/**',
			'**/dist/**',
			'**/dist',
			'apps/web-extension/.wxt/**',
			'apps/web-extension/.output/**',
			'CONTRIBUTING.md',
			'LICENSE',
			'README.md',
			'SECURITY.md',
			'*.png',
			'*.env.example',
			'docker-compose*.yml',
			'eslint.config.js',
			'apps/api/**',
			'apps/web/**',
		],
	},
});
