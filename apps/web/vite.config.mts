import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
	const env = {
		...process.env,
		...loadEnv(mode, '../../', ''),
	};

	return {
		server: {
			host: '0.0.0.0',
			port: Number(env.WEB_PORT),
			proxy: {
				'/graphql': env.API_URL as string,
				'/inbox': env.API_URL as string,
			},
		},
		define: {
			'process.env': env,
		},
		plugins: [
			tanstackRouter({
				target: 'react',
				autoCodeSplitting: true,
				tmpDir: 'src/.tsr-temp',
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
			}),
		],
		resolve: {
			alias: {
				'@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
			},
		},
		optimizeDeps: {
			include: ['@inboxt/common'],
		},
	};
});
