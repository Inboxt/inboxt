import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
	const rootEnv = loadEnv(mode, '../../', '');
	Object.assign(process.env, rootEnv);

	return {
		envDir: '../../',
		server: {
			host: '0.0.0.0',
			port: Number(process.env.WEB_PORT) || 3000,
			proxy: {
				'/graphql': process.env.API_URL!,
				'/inbox': process.env.API_URL!,
			},
		},
		plugins: [
			tanstackRouter({
				target: 'react',
				autoCodeSplitting: true,
			}),
			react(),
			tsconfigPaths(),
			VitePWA({
				registerType: 'autoUpdate',
				includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png'],
				manifest: {
					name: 'Inboxt',
					short_name: 'Inboxt',
					start_url: '/',
					scope: '/',
					theme_color: '#55a57e',
					background_color: '#55a57e',
					display: 'standalone',
					icons: [
						{
							src: '/web-app-manifest-192x192.png',
							sizes: '192x192',
							type: 'image/png',
							purpose: 'maskable',
						},
						{
							src: '/web-app-manifest-512x512.png',
							sizes: '512x512',
							type: 'image/png',
							purpose: 'maskable',
						},
					],
					share_target: {
						action: '/share-target',
						method: 'GET',
						enctype: 'application/x-www-form-urlencoded',
						params: {
							title: 'title',
							text: 'text',
							url: 'url',
						},
					},
				},
				devOptions: {
					enabled: mode === 'development',
				},
			}),
		],
		resolve: {
			alias: {
				'@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
			},
		},
		optimizeDeps: {
			include: ['@inboxt/common', '@inboxt/ui'],
		},
	};
});
